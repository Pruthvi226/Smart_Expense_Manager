import React from 'react';

/** Render the supported bold syntax as React nodes. All other input remains plain text. */
export function InlineText({ text }: { text: string }) {
  return <>{text.split(/(\*\*.*?\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={index}>{part.slice(2, -2)}</strong>
      : <React.Fragment key={index}>{part}</React.Fragment>,
  )}</>;
}
