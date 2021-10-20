/*
 * this file serves our GitHub Pages test site locally.
 * https://paypal.github.io/paypal-muse-components/
 */
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3008;

app.use('/paypal-muse-components', express.static('docs'));

app.listen(PORT, () => {
  console.log(`test server running on port ${PORT}`);
})