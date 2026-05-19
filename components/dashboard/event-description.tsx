"use client";

import DOMPurify from "dompurify";

export function EventDescription({ html }: { html: string }) {
  const sanitized =
    typeof window !== "undefined" ? DOMPurify.sanitize(html) : html;

  return (
    <div
      className="rich-text text-sm"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
