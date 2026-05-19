"use client";

import DOMPurify from "dompurify";

export function EventDescription({ html }: { html: string }) {
  return (
    <div
      className="rich-text text-sm"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  );
}
