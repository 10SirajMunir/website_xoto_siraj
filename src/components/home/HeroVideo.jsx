'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { prefersReducedMotion } from '@/lib/motion/scrollEngine';
import { isLiteDevice } from '@/lib/device';
import styles from './HeroVideo.module.css';

/**
 * Ambient skyline behind the hero, at low opacity. The poster paints first; the video only starts
 * downloading after the page has loaded, never plays for reduced motion, Data Saver or low-end phones, and pauses off screen.
 */
export default function HeroVideo() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion() || isLiteDevice()) return undefined;

    let visible = true;
    let started = false;
    let idle;
    const play = () => {
      if (visible && !document.hidden) video.play().catch(() => {});
    };
    const start = () => {
      started = true;
      video.preload = 'auto';
      video.load();
      play();
    };
    const schedule = () => {
      idle = window.requestIdleCallback ? window.requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 300);
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });

    const onPlaying = () => { video.dataset.playing = ''; };
    video.addEventListener('playing', onPlaying);

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!started) return;
      if (visible) play();
      else video.pause();
    });
    observer.observe(video);
    const onVisibility = () => (document.hidden ? video.pause() : started && play());
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('load', schedule);
      if (window.cancelIdleCallback && idle) window.cancelIdleCallback(idle);
      clearTimeout(idle);
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      video.removeEventListener('playing', onPlaying);
    };
  }, []);

  return (
    <div className={styles.media} aria-hidden="true">
      <div className={styles.layer}>
        <Image src="/video/hero-poster.webp" alt="" fill sizes="100vw" quality={60} preload className={styles.poster} />
        <video ref={videoRef} className={styles.video} muted loop playsInline preload="none" disablePictureInPicture tabIndex={-1}>
          <source src="/video/hero-720.mp4" type="video/mp4" media="(max-width: 720px)" />
          <source src="/video/hero-1280.mp4" type="video/mp4" />
        </video>
      </div>
      <div className={styles.wash} />
    </div>
  );
}
