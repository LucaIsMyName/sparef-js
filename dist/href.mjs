// src/href.ts
// src/prefetch.ts
function $f29a4c4041b59d39$export$71ab63dc1c645859(container, options) {
    if (!options.active) return;
    const links = container.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
    links.forEach((link)=>{
        link.addEventListener(options.event, ()=>{
            setTimeout(()=>{
                const href = link.getAttribute("href");
                if (href) {
                    const prefetchLink = document.createElement("link");
                    prefetchLink.rel = "prefetch";
                    prefetchLink.href = href;
                    document.head.appendChild(prefetchLink);
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


function $8904ee15b0b5d17a$export$f6cf5dea3b94971d(container, options) {
    const links = container.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
    links.forEach((link)=>{
        link.addEventListener("click", (e)=>{
            e.preventDefault();
            const href = link.getAttribute("href");
            if (href) {
                if (document.startViewTransition) $8904ee15b0b5d17a$var$performViewTransition(href, options);
                else $8904ee15b0b5d17a$var$performFallbackTransition(href, options);
            }
        });
    });
}
async function $8904ee15b0b5d17a$var$performViewTransition(href, options) {
    try {
        const transition = document.startViewTransition(()=>{
            window.location.href = href;
        });
        await transition.finished;
    } catch (error) {
        console.error("View transition failed:", error);
        window.location.href = href;
    }
}
function $8904ee15b0b5d17a$var$performFallbackTransition(href, options) {
    const duration = options.duration;
    const outAnim = $8904ee15b0b5d17a$var$createKeyframeAnimation(options.out, "out");
    const inAnim = $8904ee15b0b5d17a$var$createKeyframeAnimation(options.in, "in");
    const outAnimation = document.documentElement.animate(outAnim.keyframes, {
        duration: options.timeline === "sequential" ? duration / 2 : duration,
        easing: "ease-in-out"
    });
    outAnimation.onfinish = ()=>{
        window.location.href = href;
        document.documentElement.animate(inAnim.keyframes, {
            duration: options.timeline === "sequential" ? duration / 2 : duration,
            easing: "ease-in-out"
        });
    };
}
function $8904ee15b0b5d17a$var$createKeyframeAnimation(animOptions, prefix) {
    const fromStyles = Object.entries(animOptions.from).map(([key, value])=>`${(0, $fab42eb3dee39b5b$export$7428e6464c9e15e8)(key)}: ${value};`).join(" ");
    const toStyles = Object.entries(animOptions.to).map(([key, value])=>`${(0, $fab42eb3dee39b5b$export$7428e6464c9e15e8)(key)}: ${value};`).join(" ");
    const keyframes = `
    @keyframes ${prefix}-animation {
      from { ${fromStyles} }
      to { ${toStyles} }
    }
  `;
    const style = document.createElement("style");
    style.textContent = keyframes;
    document.head.appendChild(style);
    return {
        keyframes: [
            {
                [prefix]: "0%"
            },
            {
                [prefix]: "100%"
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
function $883a9a8e248925a3$export$8f51af5840e0602a(selector, options = {}) {
    const mergedOptions = (0, $fab42eb3dee39b5b$export$981532776ab2217e)(options, $883a9a8e248925a3$var$defaultOptions);
    const container = document.querySelector(selector);
    if (!container) {
        console.error(`No element found with selector: ${selector}`);
        return;
    }
    (0, $f29a4c4041b59d39$export$71ab63dc1c645859)(container, mergedOptions.prefetch);
    (0, $8904ee15b0b5d17a$export$f6cf5dea3b94971d)(container, mergedOptions.transition);
}
var $883a9a8e248925a3$export$2e2bcd8739ae039 = $883a9a8e248925a3$export$8f51af5840e0602a;


export {$883a9a8e248925a3$export$8f51af5840e0602a as href, $883a9a8e248925a3$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=href.mjs.map
