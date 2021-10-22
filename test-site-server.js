/*
 * this file serves our GitHub Pages test site locally.
 * https://paypal.github.io/paypal-muse-components/
 */
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3008;

app.use('/paypal-muse-components', express.static('docs'));

app.listen(PORT, () => {
  console.log(`Test site running on http://localhost:${PORT}/paypal-muse-components/`);
});
