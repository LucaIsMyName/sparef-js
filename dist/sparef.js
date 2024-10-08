
function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "sparef", () => $41d6d52d9d8f742f$export$c77bd49b7cb4348a);
$parcel$export(module.exports, "default", () => $41d6d52d9d8f742f$export$2e2bcd8739ae039);
$parcel$export(module.exports, "animate", () => $48b09cc005396437$export$e3607ec2d7a891c4);
// src/sparef.ts
const $388f59c090300faa$var$prefetchedLinks = new Set();
function $388f59c090300faa$var$isSameOrigin(href) {
    try {
        const url = new URL(href, window.location.origin);
        return url.origin === window.location.origin;
    } catch  {
        return false;
    }
}
function $388f59c090300faa$export$71ab63dc1c645859(container, options) {
    console.log("Setting up prefetch with options:", options);
    if (!options.active) return;
    const links = container.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"], a[href^="http://"], a[href^="https://"]');
    links.forEach((link)=>{
        link.addEventListener(options.event, ()=>{
            setTimeout(()=>{
                const href = link.getAttribute("href");
                if (href && !$388f59c090300faa$var$prefetchedLinks.has(href) && (options.sameOrigin === false || $388f59c090300faa$var$isSameOrigin(href))) {
                    const prefetchLink = document.createElement("link");
                    prefetchLink.rel = "prefetch";
                    prefetchLink.href = href;
                    document.head.appendChild(prefetchLink);
                    $388f59c090300faa$var$prefetchedLinks.add(href);
                    console.log("Prefetched: ", href);
                }
            }, options.delay);
        });
    });
}


// src/transition.ts
// src/utils.ts
/**
 * @description This function takes two objects, 
 * options and defaults, and returns a new object 
 * with the default values applied to the options object. 
 * If a key exists in both objects, the value from 
 * the options object is used. If the value is an object, 
 * the function is called recursively to apply the defaults 
 * to the nested object.
 */ function $9ba0f9a5c47c04f2$export$981532776ab2217e(options, defaults) {
    const result = {
        ...defaults
    };
    for(const key in options)if (Object.prototype.hasOwnProperty.call(options, key)) {
        const value = options[key];
        if (typeof value === "object" && value !== null && key in result) result[key] = $9ba0f9a5c47c04f2$export$981532776ab2217e(value, result[key]);
        else result[key] = value;
    }
    return result;
}
function $9ba0f9a5c47c04f2$export$7428e6464c9e15e8(str) {
    return str.replace(/[A-Z]/g, (letter)=>`-${letter.toLowerCase()}`);
}


const $48b09cc005396437$var$customAnimations = new Map();
function $48b09cc005396437$export$e3607ec2d7a891c4(selector, options) {
    $48b09cc005396437$var$customAnimations.set(selector, options);
}
let $48b09cc005396437$var$styleCounter = 0;
class $48b09cc005396437$var$MockAnimation {
    // Implement finished and ready as getters
    get finished() {
        return Promise.resolve(this);
    }
    get ready() {
        return Promise.resolve(this);
    }
    cancel() {}
    commitStyles() {}
    finish() {}
    pause() {}
    persist() {}
    play() {}
    reverse() {}
    updatePlaybackRate(_playbackRate) {}
    addEventListener(_type, _listener, _options) {}
    removeEventListener(_type, _listener, _options) {}
    dispatchEvent(_event) {
        return false;
    }
    constructor(){
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
}
function $48b09cc005396437$export$f6cf5dea3b94971d(container, options, animateFunction = (element, keyframes, options)=>{
    if (typeof element.animate === "function") return element.animate(keyframes, options);
    else return new $48b09cc005396437$var$MockAnimation();
}) {
    console.log("Setting up transition with options:", options);
    const links = container.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
    links.forEach((link)=>{
        link.addEventListener("click", (e)=>{
            e.preventDefault();
            const href = link.getAttribute("href");
            if (href) $48b09cc005396437$var$navigateTo(href, container, options, animateFunction);
        });
    });
    // Add popstate event listener for browser back/forward buttons
    window.addEventListener("popstate", (event)=>{
        if (event.state && event.state.href) $48b09cc005396437$var$navigateTo(event.state.href, container, options, animateFunction, false);
        else // If there's no state, assume it's a back navigation to the initial page
        $48b09cc005396437$var$navigateTo(window.location.pathname, container, options, animateFunction, false);
    });
}
async function $48b09cc005396437$var$navigateTo(href, container, options, animateFunction, pushState = true) {
    console.log(`navigateTo called with href: ${href}, pushState: ${pushState}`);
    if (document.startViewTransition) {
        console.log("Using performViewTransition");
        await $48b09cc005396437$var$performViewTransition(href, container, options, animateFunction);
    } else {
        console.log("Using performFallbackTransition");
        await $48b09cc005396437$var$performFallbackTransition(href, container, options, animateFunction);
    }
    if (pushState) {
        console.log("Pushing state");
        history.pushState({
            href: href
        }, "", href);
    } else {
        console.log("Updating DOM for back navigation");
        await $48b09cc005396437$var$updateDOM(href, container, options, animateFunction);
    }
}
function $48b09cc005396437$export$a53971ec246c2bc4(animation) {
    function styleObjectToString(obj) {
        return Object.entries(obj).map(([key, value])=>{
            if (typeof value === "object") return `${(0, $9ba0f9a5c47c04f2$export$7428e6464c9e15e8)(key)}: ${styleObjectToString(value)};`;
            return `${(0, $9ba0f9a5c47c04f2$export$7428e6464c9e15e8)(key)}: ${value};`;
        }).join(" ");
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
 */ function $48b09cc005396437$var$addViewTransitionCSS(container, options) {
    const outStyles = $48b09cc005396437$export$a53971ec246c2bc4(options.out);
    const inStyles = $48b09cc005396437$export$a53971ec246c2bc4(options.in);
    const styleId = `sparef-style-${$48b09cc005396437$var$styleCounter++}`;
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
 */ function $48b09cc005396437$var$removeStyle(styleId) {
    const style = document.getElementById(styleId);
    if (style) style.remove();
}
/**
 *
 * @description Perform a custom
 * view transition animation.
 */ async function $48b09cc005396437$var$performViewTransition(href, container, options, animateFunction) {
    console.log("performViewTransition called");
    try {
        const styleId = $48b09cc005396437$var$addViewTransitionCSS(container, options);
        const transition = document.startViewTransition(()=>$48b09cc005396437$var$updateDOM(href, container, options, animateFunction));
        await transition.finished;
        $48b09cc005396437$var$removeStyle(styleId);
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
 */ async function $48b09cc005396437$var$performFallbackTransition(href, container, options, animateFunction) {
    console.log("performFallbackTransition called");
    const styleId = $48b09cc005396437$var$addViewTransitionCSS(container, options);
    try {
        const duration = options.duration;
        // Animate custom elements first
        for (const [selector, customOptions] of $48b09cc005396437$var$customAnimations){
            const elements = container.querySelectorAll(selector);
            elements.forEach((element)=>{
                const mergedOptions = {
                    ...options,
                    ...customOptions
                };
                const outAnim = $48b09cc005396437$var$createKeyframeAnimation(mergedOptions.out || options.out, `out-${styleId}`);
                const inAnim = $48b09cc005396437$var$createKeyframeAnimation(mergedOptions.in || options.in, `in-${styleId}`);
                console.log("Animating custom element:", selector);
                animateFunction(element, outAnim.keyframes, {
                    duration: mergedOptions.timeline === "sequential" ? duration / 2 : duration,
                    delay: mergedOptions.delay,
                    easing: mergedOptions.easing,
                    iterations: mergedOptions.iterations === "infinite" ? Infinity : mergedOptions.iterations,
                    fill: "forwards"
                });
                setTimeout(()=>{
                    animateFunction(element, inAnim.keyframes, {
                        duration: mergedOptions.timeline === "sequential" ? duration / 2 : duration,
                        delay: mergedOptions.delay,
                        easing: mergedOptions.easing,
                        iterations: mergedOptions.iterations === "infinite" ? Infinity : mergedOptions.iterations,
                        fill: "forwards"
                    });
                }, mergedOptions.timeline === "sequential" ? duration / 2 : 0);
            });
        }
        // Animate the container
        const outAnim = $48b09cc005396437$var$createKeyframeAnimation(options.out, `out-${styleId}`);
        const inAnim = $48b09cc005396437$var$createKeyframeAnimation(options.in, `in-${styleId}`);
        console.log("Animating container out");
        animateFunction(container, outAnim.keyframes, {
            duration: options.timeline === "sequential" ? duration / 2 : duration,
            delay: options.delay,
            easing: options.easing,
            iterations: options.iterations === "infinite" ? Infinity : options.iterations,
            fill: "forwards"
        });
        await new Promise((resolve)=>setTimeout(resolve, options.timeline === "sequential" ? duration / 2 : 0));
        await $48b09cc005396437$var$updateDOM(href, container, options, animateFunction);
        console.log("Animating container in");
        animateFunction(container, inAnim.keyframes, {
            duration: options.timeline === "sequential" ? duration / 2 : duration,
            delay: options.delay,
            easing: options.easing,
            iterations: options.iterations === "infinite" ? Infinity : options.iterations,
            fill: "forwards"
        });
        await new Promise((resolve)=>setTimeout(resolve, duration));
    } finally{
        $48b09cc005396437$var$removeStyle(styleId);
        console.log("Fallback Transition complete");
    }
}
/**
 * @description Update the DOM
 * with new content.
 */ async function $48b09cc005396437$var$updateDOM(href, container, options, animateFunction) {
    try {
        const response = await fetch(href);
        const html = await response.text();
        const newDocument = new DOMParser().parseFromString(html, "text/html");
        // Update the page title
        document.title = newDocument.title;
        // Update the specific container content
        const newContent = newDocument.querySelector(container.tagName);
        if (newContent) container.innerHTML = newContent.innerHTML;
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
 */ function $48b09cc005396437$var$createKeyframeAnimation(animOptions, prefix) {
    return {
        keyframes: [
            {
                [prefix]: "0%",
                ...animOptions.from
            },
            {
                [prefix]: "100%",
                ...animOptions.to
            }
        ]
    };
}



const $41d6d52d9d8f742f$var$defaultOptions = {
    prefetch: {
        active: false,
        event: "mouseover",
        delay: 0,
        sameOrigin: true
    },
    transition: {
        duration: 250,
        delay: 0,
        timeline: "parallel",
        easing: "ease-in-out",
        iterations: 1,
        out: {
            from: {
                opacity: 1
            },
            to: {
                opacity: 0
            }
        },
        in: {
            from: {
                opacity: 0
            },
            to: {
                opacity: 1
            }
        }
    }
};
function $41d6d52d9d8f742f$export$c77bd49b7cb4348a(selector, options = {}) {
    const mergedOptions = (0, $9ba0f9a5c47c04f2$export$981532776ab2217e)(options, $41d6d52d9d8f742f$var$defaultOptions);
    console.log("Merged options:", mergedOptions); // Add this line
    const selectors = Array.isArray(selector) ? selector : [
        selector
    ];
    selectors.forEach((sel)=>{
        const container = document.querySelector(sel);
        if (!container) {
            console.error(`No element found with selector: ${sel}`);
            return;
        }
        console.log("Setting up prefetch with options:", mergedOptions.prefetch); // Add this line
        (0, $388f59c090300faa$export$71ab63dc1c645859)(container, mergedOptions.prefetch);
        (0, $48b09cc005396437$export$f6cf5dea3b94971d)(container, mergedOptions.transition);
    });
}
var $41d6d52d9d8f742f$export$2e2bcd8739ae039 = $41d6d52d9d8f742f$export$c77bd49b7cb4348a;


//# sourceMappingURL=sparef.js.map
