(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Sparef = {}));
})(this, (function (exports) { 'use strict';

    const prefetchedLinks = new Set();
    function isSameOrigin(href) {
        try {
            const url = new URL(href, window.location.origin);
            return url.origin === window.location.origin;
        }
        catch (_a) {
            return false;
        }
    }
    function setupPrefetch(container, options) {
        console.log("Setting up prefetch with options:", options);
        if (!options.active)
            return;
        const links = container.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"], a[href^="http://"], a[href^="https://"]');
        links.forEach(link => {
            link.addEventListener(options.event, () => {
                setTimeout(() => {
                    const href = link.getAttribute('href');
                    if (href && !prefetchedLinks.has(href) && (options.sameOrigin === false || isSameOrigin(href))) {
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

    // src/utils.ts
    /**
     * @description This function takes two objects,
     * options and defaults, and returns a new object
     * with the default values applied to the options object.
     * If a key exists in both objects, the value from
     * the options object is used. If the value is an object,
     * the function is called recursively to apply the defaults
     * to the nested object.
     */
    function applyDefaults(options, defaults) {
        const result = Object.assign({}, defaults);
        for (const key in options) {
            if (Object.prototype.hasOwnProperty.call(options, key)) {
                const value = options[key];
                if (typeof value === 'object' && value !== null && key in result) {
                    result[key] = applyDefaults(value, result[key]);
                }
                else {
                    result[key] = value;
                }
            }
        }
        return result;
    }
    /**
     * @description This function converts a string to
     * kebab case by replacing all uppercase letters with a
     * hyphen followed by the lowercase version of the letter.
     */
    function kebabCase(str) {
        return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
    }

    // src/transition.ts
    let styleCounter = 0;
    /**
     * @description Set up
     * transition between pages.
     */
    function setupTransition(container, options, animateFunction = (el, opts) => container.animate(el, opts)) {
        console.log("Setting up transition with options:", options);
        const links = container.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
        links.forEach((link) => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const href = link.getAttribute("href");
                if (href) {
                    if (document.startViewTransition) {
                        performViewTransition(href, container, options, animateFunction);
                    }
                    else {
                        performFallbackTransition(href, container, options, animateFunction);
                    }
                }
            });
        });
    }
    /**
     * @description Generate a CSS style
     * string from a  transition animation object.
     */
    function generateStyleString(animation) {
        function styleObjectToString(obj) {
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
    /**
     *
     * @description Add CSS styles
     * for a view transition animation.
     */
    function addViewTransitionCSS(container, options) {
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
    function removeStyle(styleId) {
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
    async function performViewTransition(href, container, options, animateFunction) {
        try {
            const styleId = addViewTransitionCSS(container, options);
            const transition = document.startViewTransition(() => updateDOM(href, container, options, animateFunction));
            await transition.finished;
            removeStyle(styleId);
            console.log("Custom Transition complete", options);
        }
        catch (error) {
            console.error("View transition failed:", error);
            window.location.href = href;
        }
    }
    /**
     *
     * @description Perform a fallback
     * transition animation.
     */
    async function performFallbackTransition(href, container, options, animateFunction) {
        const styleId = addViewTransitionCSS(container, options);
        const duration = options.duration;
        const outAnim = createKeyframeAnimation(options.out, `out-${styleId}`);
        const inAnim = createKeyframeAnimation(options.in, `in-${styleId}`);
        const animationOptions = {
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
    /**
     *
     * @description Update the DOM
     * with new content.
     */
    async function updateDOM(href, container, options, animateFunction) {
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
        }
        catch (error) {
            console.error("Failed to update DOM:", error);
            window.location.href = href;
        }
    }
    /**
     *
     * @description Create a keyframe animation
     * object from a transition animation object.
     */
    function createKeyframeAnimation(animOptions, prefix) {
        return {
            keyframes: [
                Object.assign({ [prefix]: "0%" }, animOptions.from),
                Object.assign({ [prefix]: "100%" }, animOptions.to),
            ],
        };
    }

    // src/sparef.ts
    const defaultOptions = {
        prefetch: {
            active: false,
            event: "mouseover",
            delay: 0,
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
    function sparef(selector, options = {}) {
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

    exports["default"] = sparef;
    exports.sparef = sparef;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=sparef.umd.js.map
