// src/prefetch.ts

import { PrefetchOptions } from './types';

const prefetchedLinks = new Set<string>();

/**
 * @description Set up prefetching of links.
 */
export function setupPrefetch(container: Element, options: PrefetchOptions): void {
  console.log("Setting up prefetch with options:", options);
  if (!options.active) return;

  const links = container.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');

  links.forEach(link => {
    link.addEventListener(options.event, () => {
      setTimeout(() => {
        const href = link.getAttribute('href');
        if (href && !prefetchedLinks.has(href)) {
          const prefetchLink = document.createElement('link');
          prefetchLink.rel = 'prefetch';
          prefetchLink.href = href;
          document.head.appendChild(prefetchLink);
          prefetchedLinks.add(href);
          console.log('Prefetched: ', href);
        }
      }, options.delay);
    });
  });
}