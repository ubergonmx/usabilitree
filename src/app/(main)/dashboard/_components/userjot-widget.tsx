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

  return (
    <Script src="https://cdn.userjot.com/sdk/v2/uj.js" type="module" strategy="afterInteractive" />
  );
}
