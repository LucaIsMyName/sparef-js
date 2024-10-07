// src/sparef.ts
const $f29a4c4041b59d39$var$prefetchedLinks = new Set();
function $f29a4c4041b59d39$var$isSameOrigin(href) {
    try {
        const url = new URL(href, window.location.origin);
        return url.origin === window.location.origin;
    } catch  {
        return false;
    }
}
function $f29a4c4041b59d39$export$71ab63dc1c645859(container, options) {
    console.log("Setting up prefetch with options:", options);
    if (!options.active) return;
    const links = container.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"], a[href^="http://"], a[href^="https://"]');
    links.forEach((link)=>{
        link.addEventListener(options.event, ()=>{
            setTimeout(()=>{
                const href = link.getAttribute("href");
                if (href && !$f29a4c4041b59d39$var$prefetchedLinks.has(href) && (options.sameOrigin === false || $f29a4c4041b59d39$var$isSameOrigin(href))) {
                    const prefetchLink = document.createElement("link");
                    prefetchLink.rel = "prefetch";
                    prefetchLink.href = href;
                    document.head.appendChild(prefetchLink);
                    $f29a4c4041b59d39$var$prefetchedLinks.add(href);
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
 */ function $fab42eb3dee39b5b$export$981532776ab2217e(options, defaults) {
    const result = {
        ...defaults
    };
    for(const key in options)if (Object.prototype.hasOwnProperty.call(options, key)) {
        const value = options[key];
        if (typeof value === "object" && value !== null && key in result) result[key] = $fab42eb3dee39b5b$export$981532776ab2217e(value, result[key]);
        else result[key] = value;
    }
    return result;
}
function $fab42eb3dee39b5b$export$7428e6464c9e15e8(str) {
    return str.replace(/[A-Z]/g, (letter)=>`-${letter.toLowerCase()}`);
}


let $8904ee15b0b5d17a$var$styleCounter = 0;
function $8904ee15b0b5d17a$export$f6cf5dea3b94971d(container, options, animateFunction = (el, opts)=>container.animate(el, opts)) {
    console.log("Setting up transition with options:", options);
    const links = container.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
    links.forEach((link)=>{
        link.addEventListener("click", (e)=>{
            e.preventDefault();
            const href = link.getAttribute("href");
            if (href) {
                if (document.startViewTransition) $8904ee15b0b5d17a$var$performViewTransition(href, container, options, animateFunction);
                else $8904ee15b0b5d17a$var$performFallbackTransition(href, container, options, animateFunction);
            }
        });
    });
}
function $8904ee15b0b5d17a$export$a53971ec246c2bc4(animation) {
    function styleObjectToString(obj) {
        return Object.entries(obj).map(([key, value])=>{
            if (typeof value === "object") return `${(0, $fab42eb3dee39b5b$export$7428e6464c9e15e8)(key)}: ${styleObjectToString(value)};`;
            return `${(0, $fab42eb3dee39b5b$export$7428e6464c9e15e8)(key)}: ${value};`;
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
 */ function $8904ee15b0b5d17a$var$addViewTransitionCSS(container, options) {
    const outStyles = $8904ee15b0b5d17a$export$a53971ec246c2bc4(options.out);
    const inStyles = $8904ee15b0b5d17a$export$a53971ec246c2bc4(options.in);
    const styleId = `sparef-style-${$8904ee15b0b5d17a$var$styleCounter++}`;
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
 */ function $8904ee15b0b5d17a$var$removeStyle(styleId) {
    const style = document.getElementById(styleId);
    if (style) style.remove();
}
/**
 * 
 * @description Perform a custom 
 * view transition animation. 
 */ async function $8904ee15b0b5d17a$var$performViewTransition(href, container, options, animateFunction) {
    try {
        const styleId = $8904ee15b0b5d17a$var$addViewTransitionCSS(container, options);
        const transition = document.startViewTransition(()=>$8904ee15b0b5d17a$var$updateDOM(href, container, options, animateFunction));
        await transition.finished;
        $8904ee15b0b5d17a$var$removeStyle(styleId);
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
 */ async function $8904ee15b0b5d17a$var$performFallbackTransition(href, container, options, animateFunction) {
    const styleId = $8904ee15b0b5d17a$var$addViewTransitionCSS(container, options);
    const duration = options.duration;
    const outAnim = $8904ee15b0b5d17a$var$createKeyframeAnimation(options.out, `out-${styleId}`);
    const inAnim = $8904ee15b0b5d17a$var$createKeyframeAnimation(options.in, `in-${styleId}`);
    const animationOptions = {
        duration: options.timeline === "sequential" ? duration / 2 : duration,
        easing: options.easing,
        iterations: options.iterations === "infinite" ? Infinity : options.iterations,
        fill: "forwards"
    };
    const outAnimation = animateFunction(outAnim.keyframes, animationOptions);
    await outAnimation.finished;
    await $8904ee15b0b5d17a$var$updateDOM(href, container, options, animateFunction);
    const inAnimation = animateFunction(inAnim.keyframes, {
        duration: options.timeline === "sequential" ? duration / 2 : duration,
        easing: options.easing,
        iterations: 1,
        fill: "forwards"
    });
    await inAnimation.finished;
    $8904ee15b0b5d17a$var$removeStyle(styleId);
    console.log("Fallback Transition complete");
}
/**
 * 
 * @description Update the DOM 
 * with new content. 
 */ async function $8904ee15b0b5d17a$var$updateDOM(href, container, options, animateFunction) {
    try {
        const response = await fetch(href);
        const html = await response.text();
        const newDocument = new DOMParser().parseFromString(html, "text/html");
        // Update the page title
        document.title = newDocument.title;
        // Update the specific container content
        const newContent = newDocument.querySelector(container.tagName);
        if (newContent) container.innerHTML = newContent.innerHTML;
        // Update the URL without reloading the page
        window.history.pushState({}, "", href);
        // Re-attach event listeners to the new content
        $8904ee15b0b5d17a$export$f6cf5dea3b94971d(container, options, animateFunction);
    } catch (error) {
        console.error("Failed to update DOM:", error);
        window.location.href = href;
    }
}
/**
 * 
 * @description Create a keyframe animation 
 * object from a transition animation object.
 */ function $8904ee15b0b5d17a$var$createKeyframeAnimation(animOptions, prefix) {
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



const $883a9a8e248925a3$var$defaultOptions = {
    prefetch: {
        active: false,
        event: "mouseover",
        delay: 0
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
function $883a9a8e248925a3$export$c77bd49b7cb4348a(selector, options = {}) {
    const mergedOptions = (0, $fab42eb3dee39b5b$export$981532776ab2217e)(options, $883a9a8e248925a3$var$defaultOptions);
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
        (0, $f29a4c4041b59d39$export$71ab63dc1c645859)(container, mergedOptions.prefetch);
        (0, $8904ee15b0b5d17a$export$f6cf5dea3b94971d)(container, mergedOptions.transition);
    });
}
var $883a9a8e248925a3$export$2e2bcd8739ae039 = $883a9a8e248925a3$export$c77bd49b7cb4348a;


export {$883a9a8e248925a3$export$c77bd49b7cb4348a as sparef, $883a9a8e248925a3$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=sparef.mjs.map
