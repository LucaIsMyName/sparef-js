// src/transition.ts

import { TransitionOptions, TransitionAnimation, TransitionStyles } from "./types";
import { kebabCase } from "./utils";

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

export function setupTransition(container: Element, options: TransitionOptions, animateFunction: (keyframes: Keyframe[], options: KeyframeAnimationOptions) => Animation = (el, opts) => container.animate(el, opts)): void {
  console.log("Setting up transition with options:", options);

  const links = container.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const href = link.getAttribute("href");

      if (href) {
        if (document.startViewTransition) {
          performViewTransition(href, container, options, animateFunction);
        } else {
          performFallbackTransition(href, container, options, animateFunction);
        }
      }
    });
  });
}

export function generateStyleString(animation: TransitionAnimation): { from: string; to: string } {
  function styleObjectToString(obj: Record<string, any>): string {
    return Object.entries(obj)
      .map(([key, value]) => {
        if (typeof value === 'object') {
          return `${kebabCase(key)}: ${styleObjectToString(value)};`;
        }
        return `${kebabCase(key)}: ${value};`;
      })
      .join(" ");
  }

  return {
    from: styleObjectToString(animation.from),
    to: styleObjectToString(animation.to)
  };
}

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

function removeStyle(styleId: string): void {
  const style = document.getElementById(styleId);
  if (style) {
    style.remove();
  }
}

async function performViewTransition(href: string, container: Element, options: TransitionOptions, animateFunction: (keyframes: Keyframe[], options: KeyframeAnimationOptions) => Animation): Promise<void> {
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

async function performFallbackTransition(href: string, container: Element, options: TransitionOptions, animateFunction: (keyframes: Keyframe[], options: KeyframeAnimationOptions) => Animation): Promise<void> {
  const styleId = addViewTransitionCSS(container, options);
  const duration = options.duration;
  const outAnim = createKeyframeAnimation(options.out, `out-${styleId}`);
  const inAnim = createKeyframeAnimation(options.in, `in-${styleId}`);
  const animationOptions: KeyframeAnimationOptions = {
    duration: options.timeline === "sequential" ? duration / 2 : duration,
    easing: options.easing,
    iterations: options.iterations === "infinite" ? Infinity : options.iterations,
    fill: "forwards",
  };
  const outAnimation = animateFunction(outAnim.keyframes, animationOptions);

  await outAnimation.finished;

  await updateDOM(href, container, options, animateFunction);

  const inAnimation = animateFunction(inAnim.keyframes, {
    duration: options.timeline === "sequential" ? duration / 2 : duration,
    easing: options.easing,
    iterations: 1,
    fill: "forwards",
  });

  await inAnimation.finished;
  removeStyle(styleId);
  console.log("Fallback Transition complete");
}

async function updateDOM(href: string, container: Element, options: TransitionOptions, animateFunction: (keyframes: Keyframe[], options: KeyframeAnimationOptions) => Animation): Promise<void> {
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

    // Update the URL without reloading the page
    window.history.pushState({}, "", href);

    // Re-attach event listeners to the new content
    setupTransition(container, options, animateFunction);
  } catch (error) {
    console.error("Failed to update DOM:", error);
    window.location.href = href;
  }
}

function createKeyframeAnimation(animOptions: TransitionAnimation, prefix: string): { keyframes: Keyframe[] } {
  return {
    keyframes: [
      { [prefix]: "0%", ...animOptions.from },
      { [prefix]: "100%", ...animOptions.to },
    ],
  };
}
