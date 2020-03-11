/* @flow */
import { logger } from './lib/logger';

let initialized = false;

/* This function is needed because of this reported issue:
 * We are from GDS ART and Identity Component team.
 * We have built a group of variables with MUSE data and a model on top of the muse variables for PPDG to detect fraud.
 * Recently we found a lot records with value = ‘identified’ in the field ‘cust_id’
 * As a solution, we temporarily suppress PPDG storecash events via Shopping SDK
 */
const shouldSuppress = () => {
  try {
    return window.location.hostname.includes('paypal.com');
  } catch (err) {
    logger.error('sdkSuppressStoreCash', err);
  }
  return false;
};

// Testing Tag
// `https://www.paypal.com/tagmanager/pptm.js?id=69d2553e-1f25-421a-a5db-a9ea117bcc9d`;
//
export const sendStoreCash = () => {
  if (initialized || shouldSuppress()) {
    return;
  }
  try {
    initialized = true;
    const m = 'paypalDDL';
    window[m] = window[m] || [];
    window[m].push({
      t: new Date().getTime(),
      event: 'snippetRun'
    });
    const f = document.getElementsByTagName('script')[0];
    const e = document.createElement('script');
    e.async = !0;
    e.src = `https://www.paypal.com/tagmanager/pptm.js?t=xo&id=${ window.location.hostname }`;
    // e.src = `https://www.paypal.com/tagmanager/pptm.js?id=69d2553e-1f25-421a-a5db-a9ea117bcc9d`;
    f.parentNode.insertBefore(e, f);
  } catch (err) {
    logger.error('sdkSendStoreCash', err);
  }
};

export const excludeStoreCash = () => {
  if (shouldSuppress()) {
    return;
  }
  try {
    const paypalDDL = window.paypalDDL || [];
    paypalDDL.push({
      event: 'userIdentification',
      identified: true
    });
  } catch (err) {
    logger.error('sdkExcludeStoreCash', err);
  }
};

export const convertStoreCash = (data = {}) => {
  if (shouldSuppress()) {
    return;
  }
  try {
    const txn_id = data.cartId || data.id || 'txn_id';
    const srce = data.source || 'source';
    const prcd = data.promo || 'NoPromo';
    const tpv = data.total || data.cartTotal || 0;
    const curr = 'USD'; // todo - grab from sdk
    const paypalDDL = window.paypalDDL || [];
    paypalDDL.push({
      event: 'txnSuccess',
      txn_id,
      srce,
      tpv,
      curr,
      prcd
    });
  } catch (err) {
    logger.error('sdkConvertStoreCash', err);
  }
};
