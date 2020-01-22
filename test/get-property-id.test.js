/* @flow */
/* global afterAll expect jest */
import { fetchContainerSettings } from '../src/lib/get-property-id';
import { getPropertyId, getValidContainer, setContainer } from '../src/lib/local-storage';

import { mockContainer1 } from './mocks';

global.fetch = jest.fn().mockImplementation(async () => {
  return {
    status: 200,
    json: () => mockContainer1
  };
});

jest.mock('@paypal/sdk-client/src', () => {
  return { getMerchantID: jest.fn().mockImplementation(() => [ mockContainer1.owner_id ]) };
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

    it('requests a container using merchantId and browser location', async (done) => {
      const expectedUrl = 'https://www.paypal.com/tagmanager/containers/xo?mrid=759SBALRW3ZTY&url=http%3A%2F%2Flocalhost';
      await fetchContainerSettings({});

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(expectedUrl);
      done();
    });

    it('returns an abridged summary of a merchant container', async (done) => {
      const expected = {
        id: mockContainer1.id,
        integrationType: mockContainer1.integration_type,
        mrid: mockContainer1.owner_id,
        programId: 'C4ENKKFUEUJ4J'
      };

      const result = await fetchContainerSettings({});

      expect(result).toEqual(expected);
      done();
    });

    it('will use the merchant-provided propertyId if one is provided', async (done) => {
      const expectedPropertyId = 'arglebargleflimflam';
      const expectedSummary = {
        id: mockContainer1.id,
        integrationType: mockContainer1.integration_type,
        mrid: mockContainer1.owner_id,
        programId: 'C4ENKKFUEUJ4J'
      };

      const resultSummary = await fetchContainerSettings({ propertyId: 'arglebargleflimflam' });
      let resultPropertyId = getPropertyId();
      resultPropertyId = resultPropertyId && resultPropertyId.propertyId;

      expect(resultSummary).toEqual(expectedSummary);
      expect(resultPropertyId).toBe(expectedPropertyId);
      done();
    });

    it('saves the container summary to localstorage', async (done) => {
      const expected = {
        id: mockContainer1.id,
        integrationType: mockContainer1.integration_type,
        mrid: mockContainer1.owner_id,
        programId: 'C4ENKKFUEUJ4J'
      };

      await fetchContainerSettings({});

      const result = getValidContainer();

      expect(result).toEqual(expected);
      done();
    });

    it('saves the containerId to localstorage as a propertyId', async (done) => {
      const expected = mockContainer1.id;

      await fetchContainerSettings({});

      let result = getPropertyId();
      result = result && result.propertyId;

      expect(result).toEqual(expected);
      done();
    });
    
    it('will return a container summary from localstorage if it exists and is less than one hour old', async (done) => {
      const expected = {
        id: 'a-totally-new-id',
        integrationType: 'manual',
        mrid: 'totatty-different-mrid',
        programId: 'a-program-id'
      };

      setContainer(expected);
      const result = await fetchContainerSettings({});

      expect(result).toEqual(expected);
      done();
    });
  });
});
