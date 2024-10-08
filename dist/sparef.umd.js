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
    const customAnimations = new Map();
    function animate(selector, options) {
        customAnimations.set(selector, options);
    }
    let styleCounter = 0;
    class MockAnimation {
        constructor() {
            this.currentTime = 0;
            this.effect = null;
            this.id = "";
            this.oncancel = null;
            this.onfinish = null;
            this.onremove = null;
            this.pending = false;
            this.playState = "idle";
            this.playbackRate = 1;
            this.replaceState = "active";
            this.startTime = 0;
            this.timeline = null;
        }
        // Implement finished and ready as getters
        get finished() {
            return Promise.resolve(this);
        }
        get ready() {
            return Promise.resolve(this);
        }
        cancel() { }
        commitStyles() { }
        finish() { }
        pause() { }
        persist() { }
        play() { }
        reverse() { }
        updatePlaybackRate(_playbackRate) { }
        addEventListener(_type, _listener, _options) { }
        removeEventListener(_type, _listener, _options) { }
        dispatchEvent(_event) {
            return false;
        }
    }
    /**
     * @description Set up
     * transition between pages.
     */
    function setupTransition(container, options, animateFunction = (element, keyframes, options) => {
        if (typeof element.animate === "function") {
            return element.animate(keyframes, options);
        }
        else {
            return new MockAnimation();
        }
    }) {
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
            else {
                // If there's no state, assume it's a back navigation to the initial page
                navigateTo(window.location.pathname, container, options, animateFunction, false);
            }
        });
    }
    async function navigateTo(href, container, options, animateFunction, pushState = true) {
        console.log(`navigateTo called with href: ${href}, pushState: ${pushState}`);
        if (document.startViewTransition) {
            console.log("Using performViewTransition");
            await performViewTransition(href, container, options, animateFunction);
        }
        else {
            console.log("Using performFallbackTransition");
            await performFallbackTransition(href, container, options, animateFunction);
        }
        if (pushState) {
            console.log("Pushing state");
            history.pushState({ href }, "", href);
        }
        else {
            console.log("Updating DOM for back navigation");
            await updateDOM(href, container);
        }
    }
    /**
     * @description Generate a CSS style
     * string from a  transition animation object.
     */
    function generateStyleString(animation) {
        function styleObjectToString(obj) {
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
        console.log("performViewTransition called");
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
        console.log("performFallbackTransition called");
        const styleId = addViewTransitionCSS(container, options);
        try {
            const duration = options.duration;
            // Animate custom elements first
            for (const [selector, customOptions] of customAnimations) {
                const elements = container.querySelectorAll(selector);
                elements.forEach((element) => {
                    const mergedOptions = Object.assign(Object.assign({}, options), customOptions);
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
                    setTimeout(() => {
                        animateFunction(element, inAnim.keyframes, {
                            duration: mergedOptions.timeline === "sequential" ? duration / 2 : duration,
                            delay: mergedOptions.delay,
                            easing: mergedOptions.easing,
                            iterations: mergedOptions.iterations === "infinite" ? Infinity : mergedOptions.iterations,
                            fill: "forwards",
                        });
                    }, mergedOptions.timeline === "sequential" ? duration / 2 : 0);
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
        }
        finally {
            removeStyle(styleId);
            console.log("Fallback Transition complete");
        }
    }
    /**
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
            // Re-attach event listeners to the new content
            // Remove this line to prevent calling setupTransition again
            // setupTransition(container, options, animateFunction);
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

    exports.animate = animate;
    exports["default"] = sparef;
    exports.sparef = sparef;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=sparef.umd.js.map
