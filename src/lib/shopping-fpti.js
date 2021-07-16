/* @flow */
import { getClientID, getMerchantID, getPartnerAttributionID } from '@paypal/sdk-client/src';

import type {
  FptiInput,
  FptiVariables,
  Config
} from '../types';

import { sendBeacon, filterFalsyValues, resolveTrackingData } from './fpti';


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
  ru: data.location,

  // Identification confidence score
  unsc: data.confidenceScore,

  // Identification type returned by VPNS
  identifier_used: data.identificationType,

  // Unverified encrypted customer account number
  cust: data.encryptedAccountNumber,

  // Analytics identifier associated with the merchant site. XO container id.
  item: data.propertyId,

  // Merchant encrypted account number
  mrid: getMerchantID()[0],

  // ClientID
  client_id: getClientID(),
    
  // Partner AttributionId
  bn_code: getPartnerAttributionID(),

  // Event Name
  event_name: data.eventName,

  // Event Type
  event_type: data.eventType,

  // Event Data
  sinfo: JSON.stringify(data.eventData),

  // Legacy value for filtering events in Herald
  page: data.page,

  // Legacy value for filtering events in Herald
  pgrp: data.page,

  // Application name
  comp: 'ppshoppingsdk_v2',

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

  product: 'ppshopping_v2'
});


export const trackFpti = (config : Config, data : FptiInput) => {
  const fptiServer = 'https://t.paypal.com/ts';
  const trackingVariables = resolveTrackingVariables(resolveTrackingData(config, data, 'ppshopping_v2', 'ppshoppingsdk_v2'));

  sendBeacon(fptiServer, filterFalsyValues(trackingVariables));
};
