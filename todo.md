# todo

- prefetch media (img, docs, ...) via `{prefetch:{media:true}}` option (prefetch sdame link only once, also prefecth external links!)
- prefetch scripts and css via `{prefetch:{scripts:true,css:true}}` (if css and scripts change), other wise scripts in the `<head>` font get reset on page load while scripts at the end of the `<body>` tag get reset (?!?!). Maker it so if a scripts is alreadyx loaded onn the current page it doesnt prefetch tough it's already loaded
- history API (forward/backward)
- delete first param (element to transition) because it's always the `<body>`!
- add animate('header'{from:{transform:'translateY(-100px)'},to:{}}) as a function to select an element and overwrite the sparef() global transition