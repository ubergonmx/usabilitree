"use client";

import Script from "next/script";
import { useEffect } from "react";

export default function UserJotWidget() {
  useEffect(() => {
    // Initialize UserJot with the proxy pattern
    if (typeof window !== "undefined") {
      window.$ujq = window.$ujq || [];
      window.uj =
        window.uj ||
        (new Proxy(
          {},
          {
            get:
              (_, p) =>
              (...a: unknown[]) =>
                window.$ujq!.push([p, ...a]),
          }
        ) as unknown as typeof window.uj);

      // Queue the init call
      window.uj!.init("cmkggn69y003q14q5g5txkar5", {
        widget: true,
        position: "left",
        theme: "auto",
        trigger: "custom", // Hide default floating bubble
      });
    }
  }, []);

  const handleLoad = () => {
    window.__ujLoaded = true;
  };

  const handleError = () => {
    window.__ujLoaded = false;
    console.warn("UserJot SDK failed to load - buttons will fallback to direct links");
  };

  return (
    <Script
      src="/api/widget"
      type="module"
      strategy="afterInteractive"
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}
