"use client";

import DOMPurify from "dompurify";

export function EventDescription({ html }: { html: string }) {
  const sanitized =
    typeof window !== "undefined" ? DOMPurify.sanitize(html) : html;

  return (
    <div
      className="rich-text"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
