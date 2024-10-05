# `sparef-js`

`sparef-js` is simple and small JS library that turns a multi-page app into a single-page app
via CSS view transition and a optional prefetch API built in.

## install

`npm install sparef-js`

## use

```js
import sparef from 'sparef-js';

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
    delay: 1000 // integer
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
     * Strings get converted from Camel to Kebab Case via sparef-js
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
```
## License

MIT