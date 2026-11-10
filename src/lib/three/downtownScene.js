/* The hero's interactive Downtown Dubai model: the Burj Khalifa, its neighbours and XOTO's office in
   One by Omniyat, built from code. It assembles brick by brick from both sides while XO circles it,
   then XOTO lights up on the tower's LED facade. Loaded on demand; renders only while something moves. */
import {
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  EdgesGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  LessEqualDepth,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PerspectiveCamera,
  RepeatWrapping,
  Scene,
  Shape,
  ShaderMaterial,
  ShapeGeometry,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
  WebGLRenderer,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const PURPLE = 0x5c039b;
const BURJ_TOP = 10.2;
const PLINTH = 5.6;
const SPIN_IN = -.6;
const AUTO_SPEED = .00005; // radians per ms: one turn in about two minutes.
const DRAG = .005; // radians per pixel dragged
const MAX_SPIN = .004; // radians per ms, so a flick turns the city a little, not a lot
const ELEV = (15 * Math.PI) / 180; // resting camera height
const ELEV_MIN = (4 * Math.PI) / 180;
const ELEV_MAX = (40 * Math.PI) / 180;

// Entrance timeline, in ms.
const T_TOWERS = 150;
const T_BURJ = 320;
const BRICK_GAP = 52;
const BRICK_FLIGHT = 720;
const XO_ORBIT = 2900; // XO circles the tower while it assembles, then lands on the spire
const T_SCREEN = 2950; // the LED facade switches on, top to bottom
const SCREEN_MS = 1100;
const ENTRY_MS = 4000;

/* Neighbouring towers: [angle in degrees, distance, height, kind, footprint, colour]. Kept clear of the lake.
   Colours follow Downtown's mix of blue-grey glass, dark glazing and sand-coloured stone. */
const TOWERS = [
  [150, 2.6, 2.9, 'box', .62, 0x9fb4c4], [170, 3.7, 2.1, 'round', .42, 0xd8cdb8], [128, 4.4, 1.5, 'box', .7, 0xe6e9ed],
  [196, 3.0, 3.5, 'step', .6, 0x7f97aa], [214, 4.3, 1.8, 'round', .5, 0xcdbfa6], [236, 3.6, 2.4, 'box', .55, 0xb8c9d6],
  [258, 4.9, 1.3, 'box', .8, 0xe2d8c6], [292, 4.8, 2.7, 'twin', .5, 0x8ea8bb], [305, 4.1, 2.3, 'gem', .62, 0x2f3d4f],
  [325, 2.9, 3.1, 'step', .58, 0xa6b9c8], [345, 4.4, 1.6, 'box', .66, 0xd5cab4], [112, 3.2, 2.2, 'round', .44, 0x92a9ba],
  [94, 4.5, 2.6, 'box', .52, 0x6f8799], [62, 4.7, 1.4, 'box', .74, 0xe8e2d6], [28, 4.8, 1.7, 'round', .5, 0xb3c4d1],
];
/** Index of One by Omniyat in TOWERS: XOTO's office. */
export const HQ_TOWER = 8;

function polar(deg, r) {
  const a = (deg * Math.PI) / 180;
  return [Math.cos(a) * r, -Math.sin(a) * r];
}

/* One wing of the Y-shaped floor plan: a slab with a rounded tip, pointing along +x. */
function wingShape(reach, width) {
  const s = new Shape();
  const r = width / 2;
  const tip = Math.max(reach - r, .05);
  s.moveTo(0, -r);
  s.lineTo(tip, -r);
  s.absarc(tip, 0, r, -Math.PI / 2, Math.PI / 2, false);
  s.lineTo(0, r);
  s.lineTo(0, -r);
  return s;
}

function extrudeUp(shape, y0, h) {
  const g = new ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 6 });
  g.rotateX(-Math.PI / 2);
  g.translate(0, y0, 0);
  return g.index ? g.toNonIndexed() : g;
}

/* The Burj as separate bricks (each wing tier, core tier and the spire), bottom to top. The setbacks
   spiral upward because each wing steps back in tiers and the three wings end at different heights. */
function burjBricks() {
  const bricks = [];
  const wingTops = [5.0, 5.7, 6.4];
  const tiers = 8;
  wingTops.forEach((top, w) => {
    for (let k = 0; k < tiers; k += 1) {
      const y0 = (top / tiers) * k;
      const f = k / (tiers - 1);
      const g = extrudeUp(wingShape(1.32 - f * .78, .64 - f * .2), y0, top / tiers);
      g.rotateY((w * 2 * Math.PI) / 3 + Math.PI / 2);
      bricks.push({ geo: g, y: y0 });
    }
  });
  [[0, 6.4, .42, .34], [6.4, 7.0, .34, .27], [7.0, 7.5, .27, .2], [7.5, 7.9, .2, .14]].forEach(([y0, y1, r0, r1]) => {
    const g = new CylinderGeometry(r1, r0, y1 - y0, 6);
    g.translate(0, (y0 + y1) / 2, 0);
    bricks.push({ geo: g.toNonIndexed(), y: y0 === 0 ? 6.35 : y0 }); // The core goes in once the wings stand.
  });
  const spire = new CylinderGeometry(.012, .13, BURJ_TOP - 7.9, 8);
  spire.translate(0, (7.9 + BURJ_TOP) / 2, 0);
  bricks.push({ geo: spire.toNonIndexed(), y: 7.9, spire: true });
  return bricks.sort((a, b) => a.y - b.y);
}

function towerGeometry(kind, h, s) {
  if (kind === 'round') {
    const g = new CylinderGeometry(s * .5, s * .56, h, 24);
    g.translate(0, h / 2, 0);
    return g;
  }
  if (kind === 'step') {
    const a = new BoxGeometry(s, h * .62, s * .8);
    a.translate(0, h * .31, 0);
    const b = new BoxGeometry(s * .72, h * .26, s * .6);
    b.translate(0, h * .75, 0);
    const c = new BoxGeometry(s * .44, h * .12, s * .4);
    c.translate(0, h * .94, 0);
    return mergeGeometries([a, b, c]);
  }
  if (kind === 'twin') {
    const a = new BoxGeometry(s * .45, h, s * .6);
    a.translate(-s * .3, h / 2, 0);
    const b = new BoxGeometry(s * .45, h * .86, s * .6);
    b.translate(s * .3, h * .43, 0);
    return mergeGeometries([a, b]);
  }
  if (kind === 'gem') {
    // One by Omniyat: a cut stone rising from the ground, its floors widening toward a faceted crown.
    const body = new CylinderGeometry(s * .62, s * .38, h * .84, 6);
    body.translate(0, h * .42, 0);
    const crown = new CylinderGeometry(s * .2, s * .62, h * .16, 6);
    crown.translate(0, h * .92, 0);
    return mergeGeometries([body.toNonIndexed(), crown.toNonIndexed()]);
  }
  const g = new BoxGeometry(s, h, s * .78);
  g.translate(0, h / 2, 0);
  return g;
}

function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function softShadowTexture(inner, outer) {
  return canvasTexture(128, 128, (ctx) => {
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, inner);
    grad.addColorStop(1, outer);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  });
}

/* Burj Khalifa cladding: silver reflective glass between polished stainless-steel vertical fins. */
function facadeTexture() {
  const t = canvasTexture(64, 64, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 64, 0);
    g.addColorStop(0, '#c3cfdb');
    g.addColorStop(1, '#b4c3d1');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    for (let x = 0; x < 64; x += 8) {
      ctx.fillStyle = 'rgba(255,255,255,.75)';
      ctx.fillRect(x, 0, 1.5, 64);
      ctx.fillStyle = 'rgba(70,90,110,.18)';
      ctx.fillRect(x + 1.5, 0, 1, 64);
    }
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    for (let y = 0; y < 64; y += 16) ctx.fillRect(0, y, 64, 1);
  });
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(2, 2);
  return t;
}

/* Floor lines for the neighbours, so they read as glazed towers rather than blocks. */
function floorsTexture() {
  const t = canvasTexture(16, 16, (ctx) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = 'rgba(40,60,80,.16)';
    ctx.fillRect(0, 0, 16, 2);
  });
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(1, 5);
  return t;
}

/* What the LED facade shows: XOTO with its letters stacked, as text runs on the real tower.
   The canvas spans SCREEN.w x (SCREEN.y1 - SCREEN.y0) model units, at 100 px per unit. */
const SCREEN = { w: 1.6, y0: 1.0, y1: 6.2, cell: .07 };
function screenTexture() {
  return canvasTexture(160, 520, (ctx, w, h) => {
    // Brand purple, fading out at the top and bottom so the screen melts into the glass.
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(92,3,155,0)');
    g.addColorStop(.1, 'rgba(110,22,178,.95)');
    g.addColorStop(.55, 'rgba(92,3,155,1)');
    g.addColorStop(.92, 'rgba(74,2,124,.95)');
    g.addColorStop(1, 'rgba(74,2,124,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '800 112px "Helvetica Neue", Arial, sans-serif';
    ['X', 'O', 'T', 'O'].forEach((ch, i) => ctx.fillText(ch, w / 2, 98 + i * 106));
    // A green line under the word, the brand's accent colour.
    ctx.fillStyle = '#64ef0a';
    ctx.fillRect(w / 2 - 34, 98 + 3 * 106 + 62, 68, 12);
  });
}

/* LED facade shader. The content is projected from the viewer's direction (like a projection-mapped
   show), so XOTO reads the same from every side; it is drawn as a grid of round LED dots, sampled at
   each dot's centre so the letters look pixelated, with a gentle twinkle. */
const SCREEN_VERT = /* glsl */ `
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const SCREEN_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uRight;
  uniform float uOn;
  uniform float uTime;
  varying vec3 vPos;
  const float W = ${SCREEN.w.toFixed(3)};
  const float Y0 = ${SCREEN.y0.toFixed(3)};
  const float Y1 = ${SCREEN.y1.toFixed(3)};
  const float CELL = ${SCREEN.cell.toFixed(3)};
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  void main() {
    vec2 q = vec2(dot(vPos, uRight), vPos.y);
    vec2 g = q / CELL;
    vec2 cell = floor(g) + .5;
    vec2 c = cell * CELL;
    vec2 uv = vec2(c.x / W + .5, (c.y - Y0) / (Y1 - Y0));
    if (uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.) discard;
    // Switches on from the top down, with a bright green scan line at the edge.
    float edge = Y1 - uOn * (Y1 - Y0 + .6);
    if (c.y < edge) discard;
    vec4 tex = texture2D(uMap, uv);
    // Round LED dots, softened when they get too small on screen to avoid shimmer.
    float px = fwidth(g.y);
    float dotMask = 1. - smoothstep(.28, .48, length(fract(g) - .5));
    dotMask = mix(dotMask, .75, smoothstep(.25, .5, px));
    float twinkle = .92 + .08 * sin(uTime * .0025 + hash(cell) * 6.2832);
    vec3 col = tex.rgb * (.6 + .55 * dotMask) * twinkle;
    float scan = 1. - smoothstep(0., .35, c.y - edge);
    col = mix(col, vec3(.39, .94, .04), scan * (1. - uOn * uOn));
    float a = tex.a * (.45 + .55 * dotMask);
    a = max(a, scan * .9 * (1. - uOn));
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`;

/* The Burj Lake in front of the tower: a soft, irregular pool. */
function lakeGeometry() {
  const s = new Shape();
  const pts = 28;
  for (let i = 0; i <= pts; i += 1) {
    const a = (i / pts) * Math.PI * 2;
    const r = 1 + .16 * Math.sin(a * 3 + .6) + .08 * Math.cos(a * 5);
    const x = Math.cos(a) * r * 1.9;
    const y = Math.sin(a) * r * .95;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  const g = new ShapeGeometry(s, 24);
  g.rotateX(-Math.PI / 2);
  g.translate(0, .101, 2.15);
  return g;
}

const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t) => Math.min(1, Math.max(0, t));
const smooth = (a, b, t) => {
  const k = clamp01((t - a) / (b - a));
  return k * k * (3 - 2 * k);
};
const Y_AXIS = new Vector3(0, 1, 0);

/**
 * @param {object} o
 * @param {HTMLCanvasElement} o.canvas
 * @param {HTMLElement} o.host  sized box the canvas fills; watched for size and visibility
 * @param {{id:string, tower:number}[]} o.pins  towers that carry a link pin
 * @param {(id:string, x:number, y:number, front:number) => void} o.onPin  called each rendered frame per pin
 * @param {(tip:{x:number,y:number}) => void} o.onLayout  screen position of the spire tip, whenever it moves
 * @param {() => void} o.onXoArrive  the 3D XO reached the spire: hand over to the page's XO
 * @param {() => void} o.onEntered  the entrance finished
 * @param {number} o.xoPx  on-screen height of the page's XO, so the 3D XO lands at the same size
 * @param {boolean} o.still  reduced motion: no entrance, no XO flight and no idle spin
 */
export function createDowntownScene({ canvas, host, pins = [], onPin, onLayout, onXoArrive, onEntered, xoPx = 100, still = false }) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(26, 1, .5, 120);
  const city = new Group();
  scene.add(city);

  scene.add(new HemisphereLight(0xffffff, 0xd9e0ea, 1.8));
  const sun = new DirectionalLight(0xfff0de, 2.1);
  sun.position.set(-7, 11, 6);
  scene.add(sun);
  const fill = new DirectionalLight(0xd8ebff, .8);
  fill.position.set(7, 4, -5);
  scene.add(fill);

  const disposables = [];
  const keep = (x) => {
    disposables.push(x);
    return x;
  };

  // Plinth, with the brand's contour rings on top.
  const plinth = new Mesh(keep(new CylinderGeometry(PLINTH, PLINTH + .05, .2, 96)), keep(new MeshLambertMaterial({ color: 0xffffff })));
  city.add(plinth);
  const ringMat = keep(new LineBasicMaterial({ color: PURPLE, transparent: true, opacity: .14 }));
  for (let r = 1.5; r < PLINTH; r += .62) {
    const pts = [];
    for (let i = 0; i < 128; i += 1) {
      const a = (i / 128) * Math.PI * 2;
      const wobble = 1 + .035 * Math.sin(a * 3 + r) + .02 * Math.cos(a * 5 - r * 2);
      pts.push(Math.cos(a) * r * wobble, .102, Math.sin(a) * r * wobble);
    }
    const g = keep(new BufferGeometry());
    g.setAttribute('position', new Float32BufferAttribute(pts, 3));
    plinth.add(new LineLoop(g, ringMat));
  }
  const glow = new Mesh(
    keep(new CircleGeometry(2.6, 48)),
    keep(new MeshBasicMaterial({ map: keep(softShadowTexture('rgba(92,3,155,.14)', 'rgba(92,3,155,0)')), transparent: true, depthWrite: false })),
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = .104;
  plinth.add(glow);
  const lake = new Mesh(keep(lakeGeometry()), keep(new MeshLambertMaterial({ color: 0x9fdcf7 })));
  plinth.add(lake);
  const ground = new Mesh(
    keep(new CircleGeometry(PLINTH * 1.5, 48)),
    keep(new MeshBasicMaterial({ map: keep(softShadowTexture('rgba(60,40,110,.16)', 'rgba(60,40,110,0)')), transparent: true, depthWrite: false })),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -.11;
  city.add(ground);

  const edgeMat = keep(new LineBasicMaterial({ color: 0x3c4a5c, transparent: true, opacity: .16 }));
  const hotMat = keep(new MeshLambertMaterial({ color: 0xe5d6f5, emissive: new Color(PURPLE), emissiveIntensity: .14 }));
  const floors = keep(floorsTexture());

  // Neighbours, each in its own colour. They slide in from whichever side of the plinth they stand on.
  const moving = [];
  const towers = TOWERS.map(([deg, dist, h, kind, s, color], i) => {
    const geo = keep(towerGeometry(kind, h, s));
    const gem = kind === 'gem';
    const mat = keep(new MeshLambertMaterial({ color, map: gem ? null : floors, flatShading: gem }));
    const group = new Group();
    const mesh = new Mesh(geo, mat);
    mesh.userData.base = mat;
    group.add(mesh);
    group.add(new LineSegments(keep(new EdgesGeometry(geo, 30)), gem ? keep(new LineBasicMaterial({ color: 0xc9d2dc, transparent: true, opacity: .7 })) : edgeMat));
    if (gem) {
      // A stone podium under the glass, as on the real tower.
      const podium = new Mesh(keep(new BoxGeometry(s * 1.5, .22, s * 1.3)), keep(new MeshLambertMaterial({ color: 0xd9cdb6 })));
      podium.position.y = .11;
      group.add(podium);
    }
    const [x, z] = polar(deg, dist);
    group.position.set(x, .1, z);
    group.rotation.y = ((deg * 7 + i * 13) % 60) * (Math.PI / 180);
    city.add(group);
    const side = x < 0 ? -1 : 1;
    moving.push({
      obj: group, at: group.position.clone(), turn: group.rotation.y,
      from: new Vector3(x + side * 9, .1 + 2.5, z), spin: side * 1.4,
      delay: T_TOWERS + (5 - dist) * 120 + (i % 3) * 70, dur: 900,
    });
    return { group, mesh, top: new Vector3(x, h + .1, z) };
  });

  // The Burj, as bricks that fly in alternately from the left and the right.
  const facade = keep(facadeTexture());
  const burjMat = keep(new MeshLambertMaterial({ color: 0xffffff, map: facade }));
  const bricks = burjBricks();
  bricks.forEach((b) => keep(b.geo));
  const brickGroup = new Group();
  city.add(brickGroup);
  bricks.forEach((b, i) => {
    const mesh = new Mesh(b.geo, burjMat);
    brickGroup.add(mesh);
    const side = i % 2 ? 1 : -1;
    moving.push({
      obj: mesh, at: new Vector3(), turn: 0,
      from: b.spire ? new Vector3(0, 6, 0) : new Vector3(side * (8 + (i % 4)), 1.2 + (i % 3) * .6, (i % 5) - 2),
      spin: b.spire ? 0 : side * 2.2,
      delay: T_BURJ + i * BRICK_GAP + (b.spire ? 220 : 0), dur: b.spire ? 600 : BRICK_FLIGHT,
    });
  });
  // Once assembled the bricks are swapped for one merged mesh: fewer draw calls for the rest of the visit.
  const burjGeo = keep(mergeGeometries(bricks.map((b) => b.geo)));
  const burj = new Group();
  burj.add(new Mesh(burjGeo, burjMat));
  const burjEdgeMat = keep(new LineBasicMaterial({ color: 0x6b7c8f, transparent: true, opacity: .22 }));
  burj.add(new LineSegments(keep(new EdgesGeometry(burjGeo, 28)), burjEdgeMat));
  burj.visible = false;
  city.add(burj);

  const beacon = new Mesh(keep(new SphereGeometry(.09, 16, 12)), keep(new MeshBasicMaterial({ color: 0x64ef0a })));
  beacon.position.y = BURJ_TOP + .02;
  city.add(beacon);

  // XOTO on the LED facade: a second pass over the assembled tower's own surface.
  const screenUniforms = { uMap: { value: keep(screenTexture()) }, uRight: { value: new Vector3(1, 0, 0) }, uOn: { value: 0 }, uTime: { value: 0 } };
  const screenMat = keep(new ShaderMaterial({
    uniforms: screenUniforms,
    vertexShader: SCREEN_VERT,
    fragmentShader: SCREEN_FRAG,
    transparent: true,
    depthWrite: false,
    depthFunc: LessEqualDepth,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -2,
  }));
  const screen = new Mesh(burjGeo, screenMat);
  screen.renderOrder = 1;
  burj.add(screen);
  function setScreen(k) {
    screenUniforms.uOn.value = k;
    screen.visible = k > 0;
  }

  // XO, as a sprite in the scene so the towers really pass in front of it while it circles.
  const xoMat = keep(new SpriteMaterial({ transparent: true, depthWrite: false }));
  const xo = new Sprite(xoMat);
  xo.visible = false;
  scene.add(xo);
  let xoReady = false;
  if (!still) {
    new TextureLoader().load('/xo/xo-sprite.webp', (tex) => {
      tex.colorSpace = SRGBColorSpace;
      xoMat.map = keep(tex);
      xoMat.needsUpdate = true;
      xoReady = true;
    });
  }
  let xoHanded = still;
  let xoFacing = 1;
  const xoPrev = new Vector3();
  const xoPos = new Vector3();
  const tip = new Vector3(0, BURJ_TOP, 0);

  /* World units per screen pixel at the spire tip, so the 3D XO can land at the page XO's size. */
  const up = new Vector3();
  function unitsPerPixel() {
    const a = tip.clone().project(camera);
    up.set(0, BURJ_TOP + 1, 0).project(camera);
    return 1 / Math.max(1e-3, Math.abs(up.y - a.y) * .5 * height);
  }

  function flyXo(t, now) {
    if (xoHanded || !xoReady) return;
    const k = clamp01(t / XO_ORBIT);
    const e = easeInOut(k);
    // An upward spiral around the tower, entering from the top-left and ending on the spire.
    const a = Math.PI - .25 - e * Math.PI * 2.3;
    const r = 6.2 - 4.6 * e;
    const orbit = new Vector3(Math.cos(a) * r, 4.2 + 5 * e + Math.sin(now * .006) * .12, Math.sin(a) * r);
    const enter = new Vector3(-10, 12.5, 3);
    const landH = xoPx * unitsPerPixel();
    const land = new Vector3(0, BURJ_TOP + landH * .46, 0);
    xoPos.copy(enter).lerp(orbit, smooth(0, .16, k)).lerp(land, smooth(.8, 1, k));
    const size = 1.7 + (landH - 1.7) * smooth(.75, 1, k);
    // Face the direction of travel on screen.
    const dx = xoPos.clone().project(camera).x - xoPrev.clone().project(camera).x;
    if (Math.abs(dx) > .0005) xoFacing = dx < 0 ? -1 : 1;
    xoPrev.copy(xoPos);
    xo.position.copy(xoPos);
    xo.scale.set(size * xoFacing, size, 1);
    xoMat.rotation = (1 - smooth(.85, 1, k)) * -.18 * xoFacing;
    xo.visible = true;
    if (k >= 1) {
      xo.visible = false;
      xoHanded = true;
      onXoArrive?.();
    }
  }

  /* Frame the model inside the host: spire tip at `top`, front of the plinth at `bottom` (fractions of
     the height), never wider than the box. Solved by a few rounds of nudging distance and aim. */
  const base = new Vector3(0, -.1, PLINTH);
  const side = new Vector3(PLINTH + .1, 0, 0);
  const aim = new Vector3();
  let elev = ELEV;
  let dist = 40;
  let aimY = 4;
  const screenY = (v) => (-v.clone().project(camera).y * .5 + .5);
  function place(d, y, el = elev) {
    aim.set(0, y, 0);
    camera.position.set(0, y + Math.sin(el) * d, Math.cos(el) * d);
    camera.lookAt(aim);
    camera.updateMatrixWorld();
  }

  let width = 1;
  let height = 1;
  let pixelCap = 1.5;
  function layout() {
    const rect = host.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    const narrow = width < 560;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelCap));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    const top = narrow ? .2 : .19;
    const bottom = narrow ? .97 : .86;
    const maxWidth = narrow ? 1.04 : .94;
    dist = 40;
    aimY = 4;
    for (let i = 0; i < 24; i += 1) {
      place(dist, aimY, ELEV);
      const fit = Math.max((screenY(base) - screenY(tip)) / (bottom - top), side.clone().project(camera).x / maxWidth);
      dist *= fit;
      place(dist, aimY, ELEV);
      const mid = (screenY(tip) + screenY(base)) / 2;
      const span = (screenY(base) - screenY(tip)) || 1;
      aimY += (((bottom - top) * .5 + top - mid) / span) * (BURJ_TOP + 1);
    }
    place(dist, aimY);
    lastTip.x = -1;
    reportTip();
    requestRender();
  }

  const lastTip = { x: -1, y: -1 };
  function reportTip() {
    const p = tip.clone().project(camera);
    const x = (p.x * .5 + .5) * width;
    const y = (-p.y * .5 + .5) * height;
    if (Math.abs(x - lastTip.x) < .3 && Math.abs(y - lastTip.y) < .3) return;
    lastTip.x = x;
    lastTip.y = y;
    onLayout?.({ x, y });
  }

  // Interaction state.
  let angle = still ? 0 : SPIN_IN;
  let velocity = 0;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let lastMove = 0;
  let idleSince = 0;
  let target = null; // An angle we glide to when a pin takes keyboard focus.
  let highlighted = null;
  let held = false; // The pointer is over the model, so pins hold still to be clicked.
  // Adaptive quality: if frames run slow, drop to 1x pixels, then stop the idle spin.
  let quality = 2;
  let slowFrames = 0;
  let sampled = 0;

  let entryStart = 0;
  let entered = still;
  let visible = true;
  let raf = 0;
  let last = 0;
  let lastDraw = 0;
  let disposed = false;
  let compiled = false;

  function settleAll() {
    moving.forEach((m) => {
      m.obj.position.copy(m.at);
      m.obj.rotation.y = m.turn;
      m.obj.visible = true;
    });
    brickGroup.visible = false;
    burj.visible = true;
    beacon.scale.setScalar(1);
    setScreen(1);
  }
  if (still) settleAll();
  else {
    moving.forEach((m) => { m.obj.visible = false; });
    beacon.scale.setScalar(.001);
    setScreen(0);
  }

  const pinWorld = new Vector3();
  const camDir = new Vector3();
  function projectPins() {
    reportTip();
    if (!onPin) return;
    camDir.set(camera.position.x, 0, camera.position.z).normalize();
    pins.forEach(({ id, tower }) => {
      const t = towers[tower];
      pinWorld.copy(t.top).applyAxisAngle(Y_AXIS, angle);
      const facing = (pinWorld.x * camDir.x + pinWorld.z * camDir.z) / Math.hypot(pinWorld.x, pinWorld.z);
      pinWorld.y += .25;
      const p = pinWorld.project(camera);
      onPin(id, (p.x * .5 + .5) * width, (-p.y * .5 + .5) * height, facing);
    });
  }

  function runEntry(now) {
    if (!entryStart) entryStart = now;
    const t = now - entryStart;
    plinth.scale.setScalar(.9 + .1 * easeOut(clamp01(t / 500)));
    moving.forEach((m) => {
      const k = clamp01((t - m.delay) / m.dur);
      m.obj.visible = k > 0;
      if (!k) return;
      const e = easeOut(k);
      m.obj.position.lerpVectors(m.from, m.at, e);
      m.obj.position.y += Math.sin(k * Math.PI) * .8; // A little arc on the way in.
      m.obj.rotation.y = m.turn + m.spin * (1 - e);
    });
    angle = SPIN_IN * (1 - easeInOut(clamp01(t / 3000)));
    const spireAt = T_BURJ + (bricks.length - 1) * BRICK_GAP + 220 + 600;
    const b = clamp01((t - spireAt) / 400);
    beacon.scale.setScalar(Math.max(.001, Math.sin(b * Math.PI * .5) * (1 + .35 * Math.sin(b * Math.PI))));
    if (t >= spireAt && !burj.visible) {
      brickGroup.visible = false;
      burj.visible = true;
    }
    if (burj.visible) burjEdgeMat.opacity = .22 * clamp01((t - spireAt) / 500);
    setScreen(easeInOut(clamp01((t - T_SCREEN) / SCREEN_MS)));
    flyXo(t, now);
    if (t >= ENTRY_MS) {
      settleAll();
      entered = true;
      idleSince = now;
      if (!xoHanded) {
        xoHanded = true;
        xo.visible = false;
        onXoArrive?.();
      }
      onEntered?.();
    }
  }

  function frame(now) {
    raf = 0;
    if (disposed) return;
    const dt = Math.min(64, now - (last || now));
    last = now;
    let busy = false;
    let idleSpin = false;

    if (!entered) {
      runEntry(now);
      busy = true;
    } else if (dragging) {
      busy = true;
    } else if (target !== null) {
      const diff = Math.atan2(Math.sin(target - angle), Math.cos(target - angle));
      angle += diff * Math.min(1, dt * .008);
      if (Math.abs(diff) < .002) target = null;
      busy = true;
    } else if (Math.abs(velocity) > .00002) {
      angle += velocity * dt;
      velocity *= Math.pow(.9, dt / 16.7);
      busy = true;
    } else if (!still && !held && quality > 0 && now - idleSince > 2500) {
      angle += AUTO_SPEED * dt;
      idleSpin = true;
      busy = true;
    }
    // After a tilt, the camera eases back to its resting height so XO's perch and the pins line up again.
    let waiting = false;
    if (!dragging && Math.abs(elev - ELEV) > .0005) {
      if (now - idleSince > 1800) {
        elev += (ELEV - elev) * Math.min(1, dt * .004);
        place(dist, aimY);
      } else if (!busy) {
        waiting = true; // Keep the loop alive until it is time to ease back, without drawing.
      }
      busy = true;
    }

    // The idle spin is slow, so 30 frames a second is plenty and halves the work.
    if (!waiting && !(idleSpin && now - lastDraw < 30)) {
      if (entered && lastDraw) watchSpeed(now - lastDraw, idleSpin ? 50 : 34);
      lastDraw = now;
      city.rotation.y = angle;
      // The screen's content faces the camera, whichever way the city has turned.
      screenUniforms.uRight.value.set(Math.cos(angle), 0, Math.sin(angle));
      screenUniforms.uTime.value = now;
      renderer.render(scene, camera);
      projectPins();
    }
    if (busy && visible) raf = requestAnimationFrame(frame);
  }

  function watchSpeed(gap, slowAt) {
    sampled += 1;
    if (gap > slowAt) slowFrames += 1;
    if (sampled < 60) return;
    if (slowFrames > 20 && quality > 0) {
      quality -= 1;
      if (quality === 1) {
        pixelCap = 1;
        renderer.setPixelRatio(1);
        renderer.setSize(width, height, false);
      }
    }
    sampled = 0;
    slowFrames = 0;
  }

  function requestRender() {
    if (!raf && !disposed && visible && compiled) {
      last = 0;
      raf = requestAnimationFrame(frame);
    }
  }

  // Drag turns the city (horizontal) and tilts the view (vertical). On touch, a swipe that starts
  // vertically stays with the page (touch-action: pan-y), so the model never traps scrolling.
  function onDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    dragging = true;
    target = null;
    velocity = 0;
    lastX = e.clientX;
    lastY = e.clientY;
    lastMove = performance.now();
    canvas.setPointerCapture?.(e.pointerId);
    host.dataset.dragging = '';
    requestRender();
  }
  function onMove(e) {
    if (!dragging) return;
    const now = performance.now();
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const dt = Math.max(1, now - lastMove);
    angle += dx * DRAG;
    velocity = Math.max(-MAX_SPIN, Math.min(MAX_SPIN, (dx * DRAG) / dt));
    if (dy) {
      elev = Math.min(ELEV_MAX, Math.max(ELEV_MIN, elev + dy * .0045));
      place(dist, aimY);
    }
    lastX = e.clientX;
    lastY = e.clientY;
    lastMove = now;
  }
  function onUp(e) {
    if (!dragging) return;
    dragging = false;
    idleSince = performance.now();
    if (performance.now() - lastMove > 80) velocity = 0;
    canvas.releasePointerCapture?.(e.pointerId);
    delete host.dataset.dragging;
    host.dataset.touched = '';
    requestRender();
  }
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);

  const resize = new ResizeObserver(layout);
  resize.observe(host);
  const seen = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && !document.hidden;
    if (visible) requestRender();
  });
  seen.observe(host);
  const onVisibility = () => {
    visible = !document.hidden;
    if (visible) requestRender();
  };
  document.addEventListener('visibilitychange', onVisibility);

  layout();
  // Compile shaders off the main thread where the browser can; elsewhere they compile on the first frame.
  const parallel = renderer.compileAsync && renderer.extensions.has('KHR_parallel_shader_compile');
  const ready = (parallel ? renderer.compileAsync(scene, camera) : Promise.resolve()).catch(() => {});
  ready.then(() => {
    if (disposed) return;
    compiled = true;
    requestRender();
    if (still) onEntered?.();
  });

  return {
    /** Turn the city so a pinned tower faces the viewer, e.g. when its link takes keyboard focus. */
    face(id) {
      const pin = pins.find((p) => p.id === id);
      if (!pin) return;
      const { top } = towers[pin.tower];
      const camAngle = Math.atan2(camera.position.x, camera.position.z);
      target = camAngle - Math.atan2(top.x, top.z);
      velocity = 0;
      idleSince = performance.now() + 4000;
      requestRender();
    },
    /** Pause the idle spin while someone is pointing at the model, so pins are easy to hit. */
    hold(on) {
      held = on;
      if (!on) idleSince = performance.now();
      requestRender();
    },
    /** Tint one pinned tower while its link is hovered or focused. */
    highlight(id) {
      if (highlighted) highlighted.mesh.material = highlighted.mesh.userData.base;
      highlighted = null;
      const pin = pins.find((p) => p.id === id);
      if (pin) {
        highlighted = towers[pin.tower];
        highlighted.mesh.material = hotMat;
      }
      requestRender();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      resize.disconnect();
      seen.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      disposables.forEach((d) => d.dispose?.());
      renderer.dispose();
    },
  };
}
