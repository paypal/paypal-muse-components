/* @flow */
import { getMerchantID } from '@paypal/sdk-client/src';

import type { Config, LegacyVariables } from '../../types';
import { sendBeacon, filterFalsyValues } from '../fpti';
import {
  getPageTitle,
  getBrowserPlugins,
  getWindowLocation,
  getDeviceInfo
} from '../get-device-info';

const resolveTrackingData = (config, data) => {
  const programId = config.containerSummary && config.containerSummary.programId;

  const deviceInfo = getDeviceInfo();
  const completeUrl = getWindowLocation();
  const browserPlugins = getBrowserPlugins();
  const pageTitle = getPageTitle();
  const mrid = getMerchantID()[0];

  return {
    ...deviceInfo,
    ...config,
    ...data,
    comp: 'tagmanagernodeweb',
    tsrce: 'tagmanagernodeweb',
    subcomponent: 'sdk',
    pageType: `${ mrid }-1`,
    e: 'im',
    t: new Date().getTime(),
    g: new Date().getTimezoneOffset(),
    completeUrl,
    browserPlugins,
    pageTitle,
    mrid,
    programId
  };
};

const resolveTrackingVariables = (data) : LegacyVariables => ({
  pgrp: [
    data.website,
    data.feature,
    data.subfeature1,
    data.subfeature2,
    data.pageType
  ].join(':'),
  page: [
    data.website,
    data.feature,
    data.subfeature1,
    data.subfeature2,
    data.pageType,
    data.userType,
    data.flavor,
    data.testVariant
  ].join(':'),
  // Application name (MUST be 'tagmanagernodeweb' in this context)
  comp: data.comp,

  // Traffic source
  tsrce: data.tsrce,

  // "Flow" Type
  fltp: data.fltp,

  // Impression event name
  es: data.es,

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

  // Browser plugins
  pl: data.browserPlugins,

  // Page title
  pt: data.pageTitle,

  // Rosetta language
  rosetta_language: data.rosettaLanguage,

  // Encrypted MerchantId
  mrid: data.mrid,

  // Analytics identifier associated with the merchant site. container id.
  item: data.propertyId,

  // ProgramId
  offer_id: data.programId,

  // Boolean that indicates if a merchant could identify a user using a paypal-independent method
  mru: data.mru,

  // Impression event
  e: data.e,

  // Timestamp
  t: data.t,

  // Timestamp relative to user
  g: data.g,

  // Originating source (client / server side)
  s: 'ci',

  // JS version
  v: 'NA',

  // client side event
  cs: 1,

  // Source identifier ("component" in fpti team's terms)
  sub_comp: data.subcomponent,

  // Page domain, path & querystring
  completeurl: data.completeUrl
});

export const legacyFpti = (config : Config, data : any) => {
  const fptiServer = 'https://t.paypal.com/ts';
  const trackingVariables = resolveTrackingVariables(resolveTrackingData(config, data));

  sendBeacon(fptiServer, filterFalsyValues(trackingVariables));
};
