// src/transition.ts

import { TransitionOptions, TransitionAnimation, TransitionStyles } from "./types";
import { kebabCase } from "./utils";

const customAnimations = new Map<string, Partial<TransitionOptions>>();

export function animate(selector: string, options: Partial<TransitionOptions>): void {
  customAnimations.set(selector, options);
}
/**
 * @description Set up
 * transition between pages.
 */
declare global {
  interface Document {
    startViewTransition?: (callback: () => void) => {
      finished: Promise<void>;
      updateCallbackDone: Promise<void>;
      ready: Promise<void>;
    };
  }
}

let styleCounter = 0;

class MockAnimation implements Animation {
  currentTime: number | null = 0;
  effect: AnimationEffect | null = null;
  id: string = "";
  oncancel: ((this: Animation, ev: AnimationPlaybackEvent) => any) | null = null;
  onfinish: ((this: Animation, ev: AnimationPlaybackEvent) => any) | null = null;
  onremove: ((this: Animation, ev: Event) => any) | null = null;
  pending: boolean = false;
  playState: AnimationPlayState = "idle";
  playbackRate: number = 1;
  replaceState: AnimationReplaceState = "active";
  startTime: number | null = 0;
  timeline: AnimationTimeline | null = null;

  // Implement finished and ready as getters
  get finished(): Promise<Animation> {
    return Promise.resolve(this);
  }

  get ready(): Promise<Animation> {
    return Promise.resolve(this);
  }

  cancel(): void {}
  commitStyles(): void {}
  finish(): void {}
  pause(): void {}
  persist(): void {}
  play(): void {}
  reverse(): void {}
  updatePlaybackRate(_playbackRate: number): void {}
  addEventListener(_type: string, _listener: EventListenerOrEventListenerObject, _options?: boolean | AddEventListenerOptions): void {}
  removeEventListener(_type: string, _listener: EventListenerOrEventListenerObject, _options?: boolean | EventListenerOptions): void {}
  dispatchEvent(_event: Event): boolean {
    return false;
  }
}
/**
 * @description Set up
 * transition between pages.
 */
export function setupTransition(
  container: Element,
  options: TransitionOptions,
  animateFunction: (element: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) => Animation = (element, keyframes, options) => {
    if (typeof element.animate === "function") {
      return element.animate(keyframes, options);
    } else {
      return new MockAnimation();
    }
  }
): void {
  console.log("Setting up transition with options:", options);

  const links = container.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const href = link.getAttribute("href");

      if (href) {
        navigateTo(href, container, options, animateFunction);
      }
    });
  });

  // Add popstate event listener for browser back/forward buttons
  window.addEventListener("popstate", (event) => {
    if (event.state && event.state.href) {
      navigateTo(event.state.href, container, options, animateFunction, false);
    } else {
      // If there's no state, assume it's a back navigation to the initial page
      navigateTo(window.location.pathname, container, options, animateFunction, false);
    }
  });
}

async function navigateTo(href: string, container: Element, options: TransitionOptions, animateFunction: (element: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) => Animation, pushState: boolean = true): Promise<void> {
  console.log(`navigateTo called with href: ${href}, pushState: ${pushState}`);
  if (document.startViewTransition) {
    console.log("Using performViewTransition");
    await performViewTransition(href, container, options, animateFunction);
  } else {
    console.log("Using performFallbackTransition");
    await performFallbackTransition(href, container, options, animateFunction);
  }

  if (pushState) {
    console.log("Pushing state");
    history.pushState({ href }, "", href);
  } else {
    console.log("Updating DOM for back navigation");
    await updateDOM(href, container, options, animateFunction);
  }
}

/**
 * @description Generate a CSS style
 * string from a  transition animation object.
 */
export function generateStyleString(animation: TransitionAnimation): { from: string; to: string } {
  function styleObjectToString(obj: Record<string, any>): string {
    return Object.entries(obj)
      .map(([key, value]) => {
        if (typeof value === "object") {
          return `${kebabCase(key)}: ${styleObjectToString(value)};`;
        }
        return `${kebabCase(key)}: ${value};`;
      })
      .join(" ");
  }

  return {
    from: styleObjectToString(animation.from),
    to: styleObjectToString(animation.to),
  };
}

/**
 *
 * @description Add CSS styles
 * for a view transition animation.
 */
function addViewTransitionCSS(container: Element, options: TransitionOptions): string {
  const outStyles = generateStyleString(options.out);
  const inStyles = generateStyleString(options.in);
  const styleId = `sparef-style-${styleCounter++}`;

  const css = `
    ::view-transition-old(${container.tagName.toLowerCase()}),
    ::view-transition-new(${container.tagName.toLowerCase()}) {
      animation-duration: ${options.duration}ms;
      animation-timing-function: ${options.easing};
      animation-iteration-count: ${options.iterations};
    }

    ::view-transition-old(${container.tagName.toLowerCase()}) {
      animation-name: sparef_fade-out-${styleId};
    }

    ::view-transition-new(${container.tagName.toLowerCase()}) {
      animation-name: sparef_fade-in-${styleId};
    }

    @keyframes sparef_fade-out-${styleId} {
      from { ${outStyles.from} }
      to { ${outStyles.to} }
    }

    @keyframes sparef_fade-in-${styleId} {
      from { ${inStyles.from} }
      to { ${inStyles.to} }
    }
  `;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = css;
  document.head.appendChild(style);

  return styleId;
}

/**
 *
 * @description Remove a style
 * tag from the DOM.
 */
function removeStyle(styleId: string): void {
  const style = document.getElementById(styleId);
  if (style) {
    style.remove();
  }
}

/**
 *
 * @description Perform a custom
 * view transition animation.
 */
async function performViewTransition(href: string, container: Element, options: TransitionOptions, animateFunction: (element: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) => Animation): Promise<void> {
  console.log("performViewTransition called");
  try {
    const styleId = addViewTransitionCSS(container, options);
    const transition = document.startViewTransition!(() => updateDOM(href, container, options, animateFunction));

    await transition.finished;
    removeStyle(styleId);
    console.log("Custom Transition complete", options);
  } catch (error) {
    console.error("View transition failed:", error);
    window.location.href = href;
  }
}

/**
 *
 * @description Perform a fallback
 * transition animation.
 */
async function performFallbackTransition(href: string, container: Element, options: TransitionOptions, animateFunction: (element: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) => Animation): Promise<void> {
  console.log("performFallbackTransition called");
  const styleId = addViewTransitionCSS(container, options);
  try {
    const duration = options.duration;

    // Animate custom elements first
    for (const [selector, customOptions] of customAnimations) {
      const elements = container.querySelectorAll(selector);
      elements.forEach((element) => {
        const mergedOptions = { ...options, ...customOptions };
        const outAnim = createKeyframeAnimation(mergedOptions.out || options.out, `out-${styleId}`);
        const inAnim = createKeyframeAnimation(mergedOptions.in || options.in, `in-${styleId}`);

        console.log('Animating custom element:', selector);
        animateFunction(element, outAnim.keyframes, {
          duration: mergedOptions.timeline === "sequential" ? duration / 2 : duration,
          delay: mergedOptions.delay,
          easing: mergedOptions.easing,
          iterations: mergedOptions.iterations === "infinite" ? Infinity : mergedOptions.iterations,
          fill: "forwards",
        });

        setTimeout(
          () => {
            animateFunction(element, inAnim.keyframes, {
              duration: mergedOptions.timeline === "sequential" ? duration / 2 : duration,
              delay: mergedOptions.delay,
              easing: mergedOptions.easing,
              iterations: mergedOptions.iterations === "infinite" ? Infinity : mergedOptions.iterations,
              fill: "forwards",
            });
          },
          mergedOptions.timeline === "sequential" ? duration / 2 : 0
        );
      });
    }

    // Animate the container
    const outAnim = createKeyframeAnimation(options.out, `out-${styleId}`);
    const inAnim = createKeyframeAnimation(options.in, `in-${styleId}`);
    
    console.log('Animating container out');
    animateFunction(container, outAnim.keyframes, {
      duration: options.timeline === "sequential" ? duration / 2 : duration,
      delay: options.delay,
      easing: options.easing,
      iterations: options.iterations === "infinite" ? Infinity : options.iterations,
      fill: "forwards",
    });

    await new Promise((resolve) => setTimeout(resolve, options.timeline === "sequential" ? duration / 2 : 0));

    await updateDOM(href, container, options, animateFunction);

    console.log('Animating container in');
    animateFunction(container, inAnim.keyframes, {
      duration: options.timeline === "sequential" ? duration / 2 : duration,
      delay: options.delay,
      easing: options.easing,
      iterations: options.iterations === "infinite" ? Infinity : options.iterations,
      fill: "forwards",
    });

    await new Promise((resolve) => setTimeout(resolve, duration));

  } finally {
    removeStyle(styleId);
    console.log("Fallback Transition complete");
  }
}

/**
 * @description Update the DOM
 * with new content.
 */
async function updateDOM(href: string, container: Element, options: TransitionOptions, animateFunction: (element: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) => Animation): Promise<void> {
  try {
    const response = await fetch(href);
    const html = await response.text();
    const newDocument = new DOMParser().parseFromString(html, "text/html");

    // Update the page title
    document.title = newDocument.title;

    // Update the specific container content
    const newContent = newDocument.querySelector(container.tagName);
    if (newContent) {
      container.innerHTML = newContent.innerHTML;
    }

    // Re-attach event listeners to the new content
    // Remove this line to prevent calling setupTransition again
    // setupTransition(container, options, animateFunction);
  } catch (error) {
    console.error("Failed to update DOM:", error);
    window.location.href = href;
  }
}

/**
 *
 * @description Create a keyframe animation
 * object from a transition animation object.
 */
function createKeyframeAnimation(animOptions: TransitionAnimation, prefix: string): { keyframes: Keyframe[] } {
  return {
    keyframes: [
      { [prefix]: "0%", ...animOptions.from },
      { [prefix]: "100%", ...animOptions.to },
    ],
  };
}
