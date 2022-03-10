MUSE Component
----------------------------------

[![build status][build-badge]][build]
[![code coverage][coverage-badge]][coverage]

[build-badge]: https://img.shields.io/github/workflow/status/paypal/paypal-muse-components/build?logo=github&style=flat-square
[build]: https://github.com/paypal/paypal-muse-components/actions?query=workflow%3Abuild
[coverage-badge]: https://img.shields.io/codecov/c/github/paypal/paypal-muse-components.svg?style=flat-square
[coverage]: https://codecov.io/github/paypal/paypal-muse-components/


MUSE component included in unified PayPal/Braintree client SDK.

### Quick start

See [src/index.js](./src/index.js)

#### Tests

```bash
npm test
```

#### Testing with different/multiple browsers

```bash
npm run karma -- --browser=Chrome
npm run karma -- --browser=Safari
npm run karma -- --browser=Firefox
npm run karma -- --browser=Chrome,Safari,Firefox
```

#### Keeping the browser open after tests

```bash
npm run karma -- --browser=Chrome --keep-open
```

#### Releasing and Publishing

- Publish your code with a patch version: 

```bash
npm run release
```

- Or `npm run release:patch`, `npm run release:minor`, `npm run release:major`

### Module structure

- `/src` - any code which should be transpiled, published, and end up in production
- `/test` - karma tests for everything in `/src`
- `__sdk__.js` - metadata for compiling and bundling the final component

#### `/src/component.js`

This module exports the public interface for the component.

```javascript
export let LebowskiPay = {
    render(options) {
        ...
    }
};
```

Then the integrating site can run:

```javascript
paypal.LebowskiPay.render({ ... });
```

#### `/__sdk__.js`

`__sdk__.js` defines any metadata which helps the sdk server compile and serve up the component.

```javascript
export default {

    /**
     * Define the lebowski-pay component
     * Now developers can include paypal.com/sdk/js?components=lebowski-pay
     */

    'lebowski-pay': {

        /**
         * Entry point. Everything exported from this module will be exported
         * in the `window.paypal` namespace.
         */

        entry: './src/index',

        /**
         * Define a static namespace.
         * Server config will be available under the `__lebowski_pay__.serverConfig` global
         */

        staticNamespace: '__lebowski_pay__',

        /**
         * Define configuration required by this module
         * 
         * - This should be in the form of a graphql query.
         * - The query will be merged with queries defined by other modules
         * - The final config will be passed as `__lebowski_pay__.serverConfig` in `./src/index` 
         */

        configQuery: `
            fundingEligibility {
                card {
                    branded
                }
            }
        `
    }
};
```


### FAQ

- **Why is there no webpack config, dist folder, or npm build command?**
  
  This module (and modules like it) are not intended to be built as standalone components. It will be pulled in and compiled/bundled on the server-side, then combined with other modules.

- **When should I publish?**
  
  When you publish, you're signing off on your changes being code-complete, fully tested, and ready for release. Publishing **will not immediately trigger a deploy**, but please only publish changes which are in a deployable state.

- **Can I define multiple components in one repo?**

  Absolutely. `__sdk__.js` allows defining multiple entry points. These should generally represent different logical ui components, with separate concerns, and loose coupling. For example:

  ```javascript
  modules: {
    'lebowski-pay': {
        entry: './src/components/lebowski-pay'
    },
    'walter-pay': {
        entry: './src/components/walter-pay'
    },
    'donnie-pay': {
        entry: './src/components/donnie-pay'
    }
  },
  ```

  Please bear in mind that this opens the door to any combination or permutation of these modules to be requested by the merchant -- hence the need for loose coupling. `donnie-pay` should never have a hard dependency on `lebowski-pay` being present.

- **Where is all of the karma, webpack, eslint, etc. config coming from?**

  This module uses `grumbler-scripts` as a common source of configuration and defaults. Any of these can be overriden, either partially, or entirely, depending on the individual needs of the module. You'll notice `.eslintrc.js`, `karma.conf.js`, etc. are lightweight wrappers which only define module-specific overrides.
