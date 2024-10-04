// src/prefetch.ts

import { PrefetchOptions } from './types';

export function setupPrefetch(container: Element, options: PrefetchOptions): void {
  if (!options.active) return;

  const links = container.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');

  links.forEach(link => {
    link.addEventListener(options.event, () => {
      setTimeout(() => {
        const href = link.getAttribute('href');
        if (href) {
          const prefetchLink = document.createElement('link');
          prefetchLink.rel = 'prefetch';
          prefetchLink.href = href;
          document.head.appendChild(prefetchLink);
        }
      }, options.delay);
    });
  });
}