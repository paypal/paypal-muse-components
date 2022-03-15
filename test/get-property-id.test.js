/* @flow */
/* global afterAll expect jest */
import { fetchContainerSettings, getContainerRequestUrl } from '../src/lib/get-property-id';
import { getPropertyId, getValidContainer, setContainer } from '../src/lib/local-storage';

import { mockContainer1 } from './mocks';

global.fetch = jest.fn().mockImplementation(async () => {
  return {
    status: 200,
    json: () => mockContainer1
  };
});

jest.mock('@paypal/sdk-client/src', () => {
  return {
    getMerchantID: jest.fn().mockImplementation(() => [ mockContainer1.owner_id ]),
    getSDKQueryParam: jest.fn()
  };
});

describe('get-property-id', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('fetchContainerSettings', () => {
    beforeEach(() => {
      window.localStorage.clear();
    });

    it('requests a container using merchantId and browser location', async () => {
      const expectedUrl = 'https://www.paypal.com/tagmanager/containers/xo?mrid=759SBALRW3ZTY&url=http%3A%2F%2Flocalhost&jlAccessToken=true';
      await fetchContainerSettings({});

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(expectedUrl);
    });

    it('returns an abridged summary of a merchant container', async () => {
      const expected = {
        id: mockContainer1.id,
        integrationType: mockContainer1.integration_type,
        mrid: mockContainer1.owner_id,
        programId: 'C4ENKKFUEUJ4J',
        applicationContext: {
          disablePptmBundle: false,
          limitUrlCapture: false
        }
      };

      const result = await fetchContainerSettings({});

      expect(result).toEqual(expected);
    });

    it('will use the merchant-provided propertyId if one is provided', async () => {
      const expectedPropertyId = 'arglebargleflimflam';
      const expectedSummary = {
        id: mockContainer1.id,
        integrationType: mockContainer1.integration_type,
        mrid: mockContainer1.owner_id,
        programId: 'C4ENKKFUEUJ4J',
        applicationContext: {
          disablePptmBundle: false,
          limitUrlCapture: false
        }
      };

      const resultSummary = await fetchContainerSettings({ propertyId: 'arglebargleflimflam' });
      let resultPropertyId = getPropertyId();
      resultPropertyId = resultPropertyId && resultPropertyId.propertyId;

      expect(resultSummary).toEqual(expectedSummary);
      expect(resultPropertyId).toBe(expectedPropertyId);
    });

    it('saves the container summary to localstorage', async () => {
      const expected = {
        id: mockContainer1.id,
        integrationType: mockContainer1.integration_type,
        mrid: mockContainer1.owner_id,
        programId: 'C4ENKKFUEUJ4J',
        applicationContext: {
          disablePptmBundle: false,
          limitUrlCapture: false
        }
      };

      await fetchContainerSettings({});

      const result = getValidContainer();

      expect(result).toEqual(expected);
    });

    it('saves the containerId to localstorage as a propertyId', async () => {
      const expected = mockContainer1.id;

      await fetchContainerSettings({});

      let result = getPropertyId();
      result = result && result.propertyId;

      expect(result).toEqual(expected);
    });

    it('will return a container summary from localstorage if it exists and is less than one hour old', async () => {
      const expected = {
        id: 'a-totally-new-id',
        integrationType: 'manual',
        mrid: 'totatty-different-mrid',
        programId: 'a-program-id',
        jlAccessToken: ''
      };

      setContainer(expected);
      const result = await fetchContainerSettings({});

      expect(result).toEqual(expected);
    });
  });

  describe('getContainerRequestUrl', () => {
    it('should return mrid based URL if mrid was defined', () => {
      const output = getContainerRequestUrl('mrid', '', null);

      expect(output).toBe('https://www.paypal.com/tagmanager/containers/xo?mrid=mrid&url=http%3A%2F%2Flocalhost&jlAccessToken=true');
    });

    it('should return client_id based URL if client_id was defined', () => {
      const output = getContainerRequestUrl('', 'client_id', null);

      expect(output).toBe('https://www.paypal.com/tagmanager/containers/xo?client_id=client_id&url=http%3A%2F%2Flocalhost&jlAccessToken=true');
    });

    it('should use paramsToPropertyIdUrl if it isn`t null', () => {
      const output = getContainerRequestUrl('', 'client_id', () => 'fictionalurl.com/');

      expect(output).toBe('fictionalurl.com/?client_id=client_id&url=http%3A%2F%2Flocalhost&jlAccessToken=true');
    });
  });
});
