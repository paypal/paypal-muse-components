/* @flow */
import {
  getClientID,
  getMerchantID,
  getPartnerAttributionID
} from '@paypal/sdk-client/src';

import type { FptiVariables } from '../../types';
import { sendBeacon } from '../fpti';

export const filterFalsyValues = (source : Object) : FptiVariables  => {
  Object.keys(source).forEach(key => {
    const val = source[key];

    if (val === '' || val === undefined || val === null || Number.isNaN(val)) {
      delete source[key];
    }
  });

  return source;
};

export const resolveTrackingVariables = (data : any) : FptiVariables => ({
  // Device height
  dh: data.deviceHeight,

  // Device width
  dw: data.deviceWidth,

  // Browser height
  bh: data.browserHeight,

  // Browser width
  bw: data.browserWidth,

  // Color depth
  cd: data.colorDepth,

  // Screen height
  sh: data.screenHeight,

  // Screen width
  sw: data.screenWidth,

  // Device type
  dvis: data.deviceType,

  // Browser type
  btyp: data.browserType,

  // Rosetta language
  rosetta_language: data.rosettaLanguage,

  // Page domain & path
  completeurl: data.location,

  // Identification confidence score
  unsc: data.confidenceScore,

  // Identification type returned by VPNS
  identifier_used: data.identificationType,

  // Unverified encrypted customer account number
  cust: data.encryptedAccountNumber,

  // Analytics identifier associated with the merchant site. XO container id.
  item: data.item,

  // Merchant encrypted account number
  mrid: data.mrid || getMerchantID()[0],

  // ClientID
  client_id: getClientID(),

  // Partner AttributionId
  bn_code: getPartnerAttributionID(),

  // Event Name
  event_name: data.eventName,

  // Event Data
  sinfo: JSON.stringify(data.eventData),

  // Legacy value for filtering events in Herald
  page: data.page,

  // Legacy value for filtering events in Herald
  pgrp: data.page,

  // Application name
  comp: 'tagmanagernodeweb',

  // Legacy impression event
  // TODO: currently hard-coded to 'im'. When additional events (add-to-cart, purchase, etc)
  // are moved to fpti this value will need to be updated.
  e: data.e,

  // Timestamp
  t: data.t,

  // Timestamp relative to user
  g: data.g,

  external_id: data.merchantProvidedUserId,

  shopper_id: data.shopperId,

  merchant_cart_id: data.cartId,

  product: 'ppshopping_v2',

  es: data.es,

  fltp: data.fltp,

  offer_id: data.offer_id,

  sub_component: data.sub_component,

  sub_flow: data.sub_flow,

  mru: data.mru,

  flag_consume: data.flag_consume
});

export const trackFpti = (data : any) => {
  const fptiServer = 'https://t.paypal.com/ts';
  const trackingVariables = resolveTrackingVariables(data);
  sendBeacon(fptiServer,  filterFalsyValues(trackingVariables));
};
