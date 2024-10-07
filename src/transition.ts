// src/transition.ts

import { TransitionOptions, TransitionAnimation, TransitionStyles } from "./types";
import { kebabCase } from "./utils";

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
      // Fallback for environments where animate is not available (like jsdom)
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
    }
  });
}

async function navigateTo(href: string, container: Element, options: TransitionOptions, animateFunction: (element: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) => Animation, pushState: boolean = true): Promise<void> {
  if (document.startViewTransition) {
    await performViewTransition(href, container, options, animateFunction);
  } else {
    await performFallbackTransition(href, container, options, animateFunction);
  }

  if (pushState) {
    history.pushState({ href }, "", href);
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
  const styleId = addViewTransitionCSS(container, options);
  try {
    const duration = options.duration;
    const outAnim = createKeyframeAnimation(options.out, `out-${styleId}`);
    const inAnim = createKeyframeAnimation(options.in, `in-${styleId}`);
    const animationOptions: KeyframeAnimationOptions = {
      duration: options.timeline === "sequential" ? duration / 2 : duration,
      easing: options.easing,
      iterations: options.iterations === "infinite" ? Infinity : options.iterations,
      fill: "forwards",
    };
    const outAnimation = animateFunction(container, outAnim.keyframes, animationOptions);

    if (outAnimation.finished) {
      await outAnimation.finished;
    } else {
      await new Promise((resolve) => setTimeout(resolve, animationOptions.duration as number));
    }

    await updateDOM(href, container, options, animateFunction);

    const inAnimation = animateFunction(container, inAnim.keyframes, {
      duration: options.timeline === "sequential" ? duration / 2 : duration,
      easing: options.easing,
      iterations: 1,
      fill: "forwards",
    });

    if (inAnimation.finished) {
      await inAnimation.finished;
    } else {
      await new Promise((resolve) => setTimeout(resolve, duration / 2));
    }
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
    setupTransition(container, options, animateFunction);
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
