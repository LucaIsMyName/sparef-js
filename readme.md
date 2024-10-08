# `sparef-js`

*This Code is a Beta-Version*

`sparef-js` is simple and small JS library that turns a multi-page app into a single-page app
via CSS `::view-transitions` and a optional prefetch HTML API built in.

## install

`npm install sparef-js`

## use

```js
import sparef, { animate } from 'sparef-js';

/**
 * Any <a> that is an internal link inside the <body> tag
 * creates a view-transition when triggered and loads the new page
 * in a SPA like mode.
*/
sparef('body', {
  /**
   * Prefetch links on a given event 
   * and after a given delay.
  */
  prefetch: {
    active: true, // boolean
    event: 'DOMContentLoaded', // any JS Event
    delay: 1000 // integer (loads prefetch link 1s after pageload),
    isSameOrigin: true, // default is "true", optionaly "false" or undefined/not set (=== true)
  },
  transition: {
    duration: 1000, // integer
    delay: 100, // integer
    timeline: 'sequential', // or 'parallel'
    easing: 'ease', // any CSS easing compatible string
    iteration: 1,  // number or "infinte"
    /**
     * 'in' and 'out' sets CSS keyframes,
     * write CSS keframes as a JS Object.
     * Strings get converted from Camel to Kebab Case 
     * via sparef-js and set as temporary CSS animations
     * in the DOM.
    */
    out: {
      from: { opacity: 1, backgroundColor: 'green' },
      to: { opacity: 0, backgroundColor: 'transparent' }
    },
    in: {
      from: { opacity: 0, backgroundColor: 'transparent' },
      to: { opacity: 1, backgroundColor: 'orange' }
    }
  }
});

/**
 * Whatever the globally set transition would be, 
 * the animate function overwrites this on the given element(s)
 * if there are more than 1 header element in the html, it animates
 * all of them.
 */
animate('header', {
 in: {
  from: {
    tranform: 'translate(-100%)'
  },
  to: {
    tranform: 'translate(0)'
  }
 },
 out: {
  from: {
    tranform: 'translate(0)'
  },
  to: {
    tranform: 'translate(-100%)'
  }
 }
})
```
## License

MIT