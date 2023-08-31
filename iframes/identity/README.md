# Identity Iframe

This iframe is designed to identify user country and user info.

It is served by **musenodeweb**

Iframe Url:
* `https://www.paypal.com/muse/identity/v2/index.html`

### Local debugging
For local check run following command:

```
npm run identity:dev
```

By default, iframe is served on URL http://localhost:8080/muse2/

Shopping analytics accepts following parameters:

```
ShoppingAnalytics({
  paramsToIdentityUrl: ()=> 'http://localhost:8080/muse2/',
});
```

### Deploy process
1. Run `npm run build-identity-iframe`
2. Copy content of `dist/identity/` in `musenodeweb/public/identity/v2/`
3. Deploy `musenodeweb` in production