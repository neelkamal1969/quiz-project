import React, { useState } from 'react';
import { EMOJI_3D } from '../../lib/emoji3d';

// Premium 3D-rendered emoji with a gentle pulse/float.
// Falls back SILENTLY to the real emoji when:
//   - the emoji isn't mapped to an asset, or
//   - the 3D image fails to load (404 / slow network / offline).
// The pulse is automatically disabled under prefers-reduced-motion (global rule).
//
// Props: code (emoji char, required), size (px), pulse (bool), alt, style.
export default function Icon3D({ code, size = 22, pulse = true, alt, style }) {
  const key = code ? EMOJI_3D[code.replace(/️/g, '')] : null;
  const [failed, setFailed] = useState(false);

  // Without an explicit `alt`, the icon is decorative and hidden from screen
  // readers (avoids announcing raw emoji); with `alt` it is exposed as an image.
  const decorative = !alt;

  if (!key || failed) {
    return (
      <span
        {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': alt })}
        style={{ fontSize: size, lineHeight: 1, display: 'inline-block', verticalAlign: 'middle', ...style }}
      >
        {code}
      </span>
    );
  }

  return (
    <img
      src={`/emoji3d/${key}.png`}
      alt={alt || ''}
      aria-hidden={decorative || undefined}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
      className={pulse ? 'ds-icon3d' : undefined}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        objectFit: 'contain',
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.35))',
        ...style,
      }}
    />
  );
}
