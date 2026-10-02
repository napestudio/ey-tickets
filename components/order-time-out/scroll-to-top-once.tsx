"use client";

import { useEffect } from "react";

/**
 * This page replaces a tall checkout form with a short confirmation message
 * in place (via router.refresh()/action revalidation, not a real navigation),
 * so the browser keeps the old scroll offset and the user ends up looking at
 * empty space below the shorter content. Mount this once on that shorter view
 * to bring the viewport back to the top.
 */
export default function ScrollToTopOnce() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  return null;
}
