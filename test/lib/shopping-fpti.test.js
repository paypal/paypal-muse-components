/* globals jest expect */
/* @flow */
import {
  resolveTrackingVariables,
  trackFpti,
} from "../../src/lib/shopping-fpti";

import { resolveTrackingData, sendBeacon, filterFalsyValues } from "../../src/lib/fpti";

jest.mock("../../src/lib/fpti");

const fptiInput = {
  deviceHeight: 134,
  deviceWidth: 124,
  browserHeight: 23,
  browserWidth: 34,
  colorDepth: 234,
  screenHeight: 24,
  screenWidth: 243,
  deviceType: "Desktop",
  browserType: "Chrome",
  rosettaLanguage: "en-US",
  location: "test.business.us",
  confidenceScore: 100,
  identificationType: "RMUC",
  encryptedAccountNumber: "F4CKEENF625EL",
  eventName: "page_view",
  eventType: "page_view",
  eventData: { id: 123 },
  page: "ppshopping::page_view",
  e: "im",
  t: 1625011681839,
  g: 420,
  merchantProvidedUserId: "78f83452-550b-447d-8043-44e836608810",
  shopperId: "8b44b326-9885-4e0c-bf0c-36c64d6a8521",
};

describe("should map tracking data", () => {
  it("should map tracking data with default values", () => {
    const trackingData = resolveTrackingVariables(fptiInput);
    expect(trackingData.product).toEqual("ppshopping_v2");
    expect(trackingData.e).toEqual("im");
    expect(trackingData.comp).toEqual("ppshoppingsdk_v2");
    expect(trackingData.page).toEqual("ppshopping::page_view");

    expect(trackingData.dh).toEqual(fptiInput.deviceHeight);
    expect(trackingData.dw).toEqual(fptiInput.deviceWidth);
    expect(trackingData.bh).toEqual(fptiInput.browserHeight);
    expect(trackingData.bw).toEqual(fptiInput.browserWidth);
    expect(trackingData.cd).toEqual(fptiInput.colorDepth);
    expect(trackingData.sh).toEqual(fptiInput.screenHeight);
    expect(trackingData.sw).toEqual(fptiInput.screenWidth);
    expect(trackingData.dvis).toEqual(fptiInput.deviceType);
    expect(trackingData.btyp).toEqual(fptiInput.browserType);
    expect(trackingData.rosetta_language).toEqual(fptiInput.rosettaLanguage);
    expect(trackingData.ru).toEqual(fptiInput.location);
    expect(trackingData.unsc).toEqual(fptiInput.confidenceScore);
    expect(trackingData.identifier_used).toEqual(fptiInput.identificationType);
    expect(trackingData.cust).toEqual(fptiInput.encryptedAccountNumber);
    expect(trackingData.event_name).toEqual(fptiInput.eventName);
    expect(trackingData.event_type).toEqual(fptiInput.eventType);
    expect(trackingData.sinfo).toEqual(JSON.stringify(fptiInput.eventData));
    expect(trackingData.page).toEqual(fptiInput.page);
    expect(trackingData.pgrp).toEqual(fptiInput.page);
    expect(trackingData.external_id).toEqual(fptiInput.merchantProvidedUserId);
    expect(trackingData.shopper_id).toEqual(fptiInput.shopperId);
    expect(trackingData.dh).toEqual(fptiInput.deviceHeight);
  });
});

describe("trackFpti should send FPTI event", () => {
  const config = {container: 123};
  const data = {em: 'im'};

  beforeEach(() => {
    resolveTrackingData.mockClear();
    sendBeacon.mockClear();
  });
  it("trackFpti should send FPTI event", () => {
    let fptiPayload = resolveTrackingVariables(fptiInput);

    resolveTrackingData.mockReturnValue(fptiInput);
    filterFalsyValues.mockReturnValue(fptiPayload);
    
    trackFpti(config, data);

    expect(resolveTrackingData).toBeCalledWith(config, data, 'ppshopping_v2', 'ppshoppingsdk_v2');
    expect(filterFalsyValues).toBeCalledWith(fptiPayload);
    expect(sendBeacon).toBeCalledWith('https://t.paypal.com/ts', fptiPayload);
  });
});
