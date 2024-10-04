# `href.js`

## cli

### Build

`npm run build`

This created a `dist/` Directory

### Tests
`npm test`
`npm test -- --watch`



## install

`npm install hrefjs`

## use

```typescript
import { href } from 'sparef-js';

href('html', {
  prefetch: {
    active: true,
    event: 'DOMContentLoaded',
    delay: 1000
  },
  transition: {
    duration: 1000,
    delay: 100,
    timeline: 'sequential',
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

For more details, please refer to the documentation.

## License

MIT