// src/sparef.ts

import { setupPrefetch } from "./prefetch";
import { setupTransition, animate } from "./transition";
import { applyDefaults } from "./utils";
import { SparefOptions, PrefetchOptions, TransitionOptions } from "./types";

const defaultOptions: SparefOptions = {
  prefetch: {
    active: false,
    event: "mouseover",
    delay: 0,
    sameOrigin: true,
  },
  transition: {
    duration: 250,
    delay: 0,
    timeline: "parallel",
    easing: "ease-in-out",
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

/**
 *
 * @description Set up SPA transitions and prefetching.
 */
export function sparef(selector: string | string[], options: Partial<SparefOptions> = {}): void {
  const mergedOptions = applyDefaults(options, defaultOptions);
  console.log("Merged options:", mergedOptions); // Add this line

  const selectors = Array.isArray(selector) ? selector : [selector];

  selectors.forEach((sel) => {
    const container = document.querySelector(sel);
    if (!container) {
      console.error(`No element found with selector: ${sel}`);
      return;
    }

    console.log("Setting up prefetch with options:", mergedOptions.prefetch); // Add this line
    setupPrefetch(container, mergedOptions.prefetch);
    setupTransition(container, mergedOptions.transition);
  });
}

export { animate };
export default sparef;
