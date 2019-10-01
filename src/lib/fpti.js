/* @flow */
import { getDeviceInfo } from './get-device-info';

const sendBeacon = (src, data) => {
    if (!src || !data) {
        return;
    }

    let query = [];

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            query.push(`${ encodeURIComponent(key) }=${ encodeURIComponent(data[key]) }`);
        }
    }

    query = query.join('&');

    const beaconImage = new window.Image();
    beaconImage.src = `${ src }?${ query }`;
};

const filterFalsyValues = source => {
    const result = {};

    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            // Only add to tracking source is values are truthy, `false`, or `0`
            // (reject empty string, `undefined`, `null`, and `NaN`)
            if (source[key] || source[key] === false || source[key] === 0) {
                result[key] = source[key];
            }
        }
    }

    return result;
};

const resolveTrackingData = data => {
    const deviceInfo = getDeviceInfo();

    return {
        identifier: 'tagmanagernodeweb',
        website: 'muse',
        feature: 'third-party',
        s: 'ci',
        subfeature1: '',
        subfeature2: '',
        sub_component: '',
        pageType: '',
        userType: '',
        flavor: '',
        es: '',
        testVariant: '',
        link: '',
        erpg: '',
        context: {},
        flag_consume: '',
        ...deviceInfo,
        ...data
    };
};

const resolveTrackingVariables = (data, forceOverrides) => ({
    // Page Group
    pgrp: [
        data.website,
        data.feature,
        data.subfeature1,
        data.subfeature2,
        data.pageType
    ].join(':'),

    // Page name
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

    // Impression event
    e: 'im',

    // Source identifier
    tsrce: data.identifier,

    // Source identifier ("component" in fpti team's terms)
    comp: data.identifier,

    // Source identifier ("component" in fpti team's terms)
    sub_component: data.sub_component,

    // Originating source (client / server side)
    s: data.s,

    // Item originating the track
    item: data.item,

    // Flow Type
    fltp: data.fltp,

    // Link string identifier
    link: data.link,

    // Impression event name ("event subtype" in FPTI team's terms)
    es: data.flavor,

    // Encrypted customer account number
    cust: data.cust,

    // Encrypted merchant account number
    mrid: data.mrid,

    // Error string
    erpg: data.erpg,

    // Error/status code
    error_code: data.error_code,

    // PXP: experience user is seeing
    xe: data.xe,

    // PXP: treatment user is seeing
    xt: data.xt,

    // PXP: list of experiment ids
    qe: data.qe,

    // PXP: list of treatment ids
    qt: data.qt,

    // Partner BN Code
    code: data.context.bn_code,

    // Partner Name
    partner_name: data.context.partner_name,

    // EDS: flag for EDS to consume data into insights pipeline
    flag_consume: data.flag_consume,

    // Device height
    dh: data.dh || data.screenHeight,

    // Device width
    dw: data.dw || data.screenWidth,

    // Browser height
    bh: data.bh || data.browserHeight,

    // Browser width
    bw: data.bw || data.browserWidth,

    // Color depth
    cd: data.cd || data.colorDepth,

    // Screen height
    sh: data.sh || data.screenHeight,

    // Screen width
    sw: data.sw || data.screenWidth,

    // Js client version
    v: data.v,

    // Browser plugins
    pl: data.pl,

    // Rosetta language
    rosetta_language: data.rosetta_language || data.rosettaLanguage,

    // Response correlation id
    correlation_id: data.correlation_id,

    // Merchant Recognized User
    // Signifies if a merchant can independently identify a visitor
    mru: data.mru,

    // Identification confidence score
    unsc: data.unsc,

    // Identification type returned by VPNS
    identifier_used: data.identifier_used,

    // Offer program id
    offer_id: data.offer_id,

    // Single offer id
    soid: data.soid,

    // Anything can be overriden or added here
    // forced overrides are not resolved, they are tracked "as is"
    // ideally, it shouldn't be necessary, but ¯\_(ツ)_/¯
    ...forceOverrides
});

const knownEventTypes = [ 'pageView' ];

const isKnownEvent = eventType => {
    for (let i = 0; i < knownEventTypes.length; ++i) {
        if (knownEventTypes[i] === eventType) {
            return i;
        }
    }

    return -1;
};

export default (eventType, data = {}, forceOverrides = {}) => {
    const fptiServer = 'https://t.paypal.com/ts';

    if (!isKnownEvent(eventType)) {
        return;
    }

    const resolvedData = resolveTrackingVariables(resolveTrackingData(data));

    const trackVariables = {
        ...resolvedData,
        e: 'im',
        t: new Date().getTime(),
        g: new Date().getTimezoneOffset(),
        ...forceOverrides
    };

    sendBeacon(fptiServer, filterFalsyValues(trackVariables));
};
