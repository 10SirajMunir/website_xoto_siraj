/**
 * Renders text word by word so each word can rise from behind a mask on reveal. Parts may carry a className.
 * `reveal={false}` leaves the timing to the caller's CSS, e.g. a hero that animates on first paint.
 */
export default function SplitText({ as: Tag = 'h2', parts, className, reveal = true }) {
  const list = typeof parts === 'string' ? [{ text: parts }] : parts;
  const label = list.map((p) => p.text).join(' ');
  let index = 0;

  return (
    <Tag className={className} data-split={reveal || undefined} aria-label={label}>
      {list.flatMap((part, p) => part.text.split(/\s+/).map((word, w) => {
        const i = index++;
        return (
          <span key={`${p}-${w}`} aria-hidden="true">
            <span className="word-mask">
              <span className={part.className} style={{ '--w': i }}>{word}</span>
            </span>{' '}
          </span>
        );
      }))}
    </Tag>
  );
}
