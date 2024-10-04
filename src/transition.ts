// src/transition.ts

import { TransitionOptions, TransitionAnimation, TransitionStyles } from './types';
import { kebabCase } from './utils';

declare global {
  interface Document {
    startViewTransition?: (callback: () => void) => {
      finished: Promise<void>;
      updateCallbackDone: Promise<void>;
      ready: Promise<void>;
    };
  }
}

export function setupTransition(container: Element, options: TransitionOptions): void {
  const links = container.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      
      if (href) {
        if (document.startViewTransition) {
          performViewTransition(href, options);
        } else {
          performFallbackTransition(href, options);
        }
      }
    });
  });
}

async function performViewTransition(href: string, options: TransitionOptions): Promise<void> {
  try {
    const transition = document.startViewTransition!(() => {
      window.location.href = href;
    });

    await transition.finished;
  } catch (error) {
    console.error('View transition failed:', error);
    window.location.href = href;
  }
}

function performFallbackTransition(href: string, options: TransitionOptions): void {
  const duration = options.duration;
  const outAnim = createKeyframeAnimation(options.out, 'out');
  const inAnim = createKeyframeAnimation(options.in, 'in');

  const outAnimation = document.documentElement.animate(outAnim.keyframes, {
    duration: options.timeline === 'sequential' ? duration / 2 : duration,
    easing: 'ease-in-out',
  });

  outAnimation.onfinish = () => {
    window.location.href = href;
    
    document.documentElement.animate(inAnim.keyframes, {
      duration: options.timeline === 'sequential' ? duration / 2 : duration,
      easing: 'ease-in-out',
    });
  };
}

function createKeyframeAnimation(animOptions: TransitionAnimation, prefix: string): { keyframes: Keyframe[] } {
  const fromStyles = Object.entries(animOptions.from as TransitionStyles).map(([key, value]) => `${kebabCase(key)}: ${value};`).join(' ');
  const toStyles = Object.entries(animOptions.to as TransitionStyles).map(([key, value]) => `${kebabCase(key)}: ${value};`).join(' ');

  const keyframes = `
    @keyframes ${prefix}-animation {
      from { ${fromStyles} }
      to { ${toStyles} }
    }
  `;

  const style = document.createElement('style');
  style.textContent = keyframes;
  document.head.appendChild(style);

  return {
    keyframes: [
      { [prefix]: '0%' },
      { [prefix]: '100%' }
    ]
  };
}