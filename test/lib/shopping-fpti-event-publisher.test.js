/* global expect jest */
/* @flow */

// import { v4 as uuidv4 } from 'uuid';

import { ShoppingEventPublisher } from '../../src/lib/shopping-fpti/shopping-fpti-event-publisher';
import { fetchContainerSettings } from '../../src/lib/get-property-id';
import { trackFpti } from '../../src/lib/shopping-fpti/shopping-fpti';

const fptiInput = {
  eventName: 'pageView',
  eventType: 'view',
  eventData: `{"id":  123}`
};

const containerSummary = {
  id: '1e37981f-024b-4680-bb67-b5dd66094fb0',
  integrationType: 'XO',
  mrid: '4JU4ZS7N3NAAE',
  programId: 'CY26RACMGXKQL',
  jlAccessToken: 'true'
};

jest.mock('../../src/lib/shopping-fpti/shopping-fpti');
jest.mock('../../src/lib/get-property-id');

describe('test ShoppingEventPublisher publish fpti events', () => {
  beforeEach(() => {
    fetchContainerSettings.mockClear();
    trackFpti.mockClear();
  });

  it('should publish FPTI event when container summary is loaded', () => {
    const config = {};
    fetchContainerSettings.mockReturnValue(Promise.resolve(containerSummary));
    const publisher = ShoppingEventPublisher(config);
    publisher.publishFptiEvent(fptiInput);
    setTimeout(
      () => expect(trackFpti).toBeCalledWith(fptiInput),
      1000
    );
  });

  it('should publish FPTI event as the propertyId is set in the config', () => {
    const config = { propertyId: 'f37af29e-890f-443d-9e61-b797c6a114b7' };
    fetchContainerSettings.mockReturnValue(Promise.resolve(null));
    const publisher = ShoppingEventPublisher(config);
    publisher.publishFptiEvent(fptiInput);
    expect(trackFpti).toBeCalledWith(fptiInput);
  });

});
