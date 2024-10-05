// src/sparef.ts
// src/prefetch.ts
const $f29a4c4041b59d39$var$prefetchedLinks = new Set();
function $f29a4c4041b59d39$export$71ab63dc1c645859(container, options) {
    if (!options.active) return;
    const links = container.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
    links.forEach((link)=>{
        link.addEventListener(options.event, ()=>{
            setTimeout(()=>{
                const href = link.getAttribute("href");
                if (href && !$f29a4c4041b59d39$var$prefetchedLinks.has(href)) {
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
function $fab42eb3dee39b5b$export$981532776ab2217e(options, defaults) {
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
    const from = Object.entries(animation.from).map(([key, value])=>`${(0, $fab42eb3dee39b5b$export$7428e6464c9e15e8)(key)}: ${value};`).join(" ");
    const to = Object.entries(animation.to).map(([key, value])=>`${(0, $fab42eb3dee39b5b$export$7428e6464c9e15e8)(key)}: ${value};`).join(" ");
    return {
        from: from,
        to: to
    };
}
function $8904ee15b0b5d17a$var$addViewTransitionCSS(container, options) {
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
function $8904ee15b0b5d17a$var$removeStyle(styleId) {
    const style = document.getElementById(styleId);
    if (style) style.remove();
}
async function $8904ee15b0b5d17a$var$performViewTransition(href, container, options, animateFunction) {
    try {
        const styleId = $8904ee15b0b5d17a$var$addViewTransitionCSS(container, options);
        const transition = document.startViewTransition(()=>$8904ee15b0b5d17a$var$updateDOM(href, container, options, animateFunction));
        await transition.finished;
        $8904ee15b0b5d17a$var$removeStyle(styleId);
        console.log("Custom Transition complete");
    } catch (error) {
        console.error("View transition failed:", error);
        window.location.href = href;
    }
}
async function $8904ee15b0b5d17a$var$performFallbackTransition(href, container, options, animateFunction) {
    const styleId = $8904ee15b0b5d17a$var$addViewTransitionCSS(container, options);
    const duration = options.duration;
    const outAnim = $8904ee15b0b5d17a$var$createKeyframeAnimation(options.out, `out-${styleId}`);
    const inAnim = $8904ee15b0b5d17a$var$createKeyframeAnimation(options.in, `in-${styleId}`);
    const outAnimation = animateFunction(outAnim.keyframes, {
        duration: options.timeline === "sequential" ? duration / 2 : duration,
        easing: options.easing,
        iterations: 1,
        fill: "forwards"
    });
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
async function $8904ee15b0b5d17a$var$updateDOM(href, container, options, animateFunction) {
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
function $8904ee15b0b5d17a$var$createKeyframeAnimation(animOptions, prefix) {
    const fromStyles = Object.entries(animOptions.from).map(([key, value])=>`${(0, $fab42eb3dee39b5b$export$7428e6464c9e15e8)(key)}: ${value};`).join(" ");
    const toStyles = Object.entries(animOptions.to).map(([key, value])=>`${(0, $fab42eb3dee39b5b$export$7428e6464c9e15e8)(key)}: ${value};`).join(" ");
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
        duration: 300,
        delay: 0,
        timeline: "sequential",
        easing: "ease",
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
    const selectors = Array.isArray(selector) ? selector : [
        selector
    ];
    selectors.forEach((sel)=>{
        const container = document.querySelector(sel);
        if (!container) {
            console.error(`No element found with selector: ${sel}`);
            return;
        }
        (0, $f29a4c4041b59d39$export$71ab63dc1c645859)(container, mergedOptions.prefetch);
        (0, $8904ee15b0b5d17a$export$f6cf5dea3b94971d)(container, mergedOptions.transition);
    });
}
var $883a9a8e248925a3$export$2e2bcd8739ae039 = $883a9a8e248925a3$export$c77bd49b7cb4348a;


export {$883a9a8e248925a3$export$c77bd49b7cb4348a as sparef, $883a9a8e248925a3$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=sparef.mjs.map
