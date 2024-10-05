// src/sparef.ts

import { setupPrefetch } from "./prefetch";
import { setupTransition } from "./transition";
import { applyDefaults } from "./utils";
import { SparefOptions, PrefetchOptions, TransitionOptions } from "./types";

const defaultOptions: SparefOptions = {
  prefetch: {
    active: false,
    event: "mouseover",
    delay: 0,
  },
  transition: {
    duration: 300,
    delay: 0,
    timeline: "sequential",
    easing: "ease",
    iterations: 1,
    out: {
      from: { opacity: 1 },
      to: { opacity: 0 },
    },
    in: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
  },
};

export function sparef(selector: string | string[], options: Partial<SparefOptions> = {}): void {
  const mergedOptions = applyDefaults(options, defaultOptions);

  const selectors = Array.isArray(selector) ? selector : [selector];

  selectors.forEach((sel) => {
    const container = document.querySelector(sel);
    if (!container) {
      console.error(`No element found with selector: ${sel}`);
      return;
    }

    setupPrefetch(container, mergedOptions.prefetch);
    setupTransition(container, mergedOptions.transition);
  });
}

export default sparef;