// src/href.ts

import { setupPrefetch } from './prefetch';
import { setupTransition } from './transition';
import { applyDefaults } from './utils';
import { HrefOptions, PrefetchOptions, TransitionOptions } from './types';

const defaultOptions: HrefOptions = {
  prefetch: {
    active: false,
    event: 'mouseover',
    delay: 0
  },
  transition: {
    duration: 300,
    delay: 0,
    timeline: 'sequential',
    out: {
      from: { opacity: 1 },
      to: { opacity: 0 }
    },
    in: {
      from: { opacity: 0 },
      to: { opacity: 1 }
    }
  }
};
export function href(selector: string, options: Partial<HrefOptions> = {}): void {
  const mergedOptions = applyDefaults(options, defaultOptions);
  
  const container = document.querySelector(selector);
  if (!container) {
    console.error(`No element found with selector: ${selector}`);
    return;
  }

  setupPrefetch(container, mergedOptions.prefetch);
  setupTransition(container, mergedOptions.transition);
}

export default href;