/* global expect jest */
/* @flow */
import { v4 as uuidv4 } from 'uuid';

import { trackFptiV2 } from '../../src/lib/fpti';
import { ShoppingEventPublisher } from '../../src/lib/shopping-fpti-event-publisher';
import { fetchContainerSettings } from '../../src/lib/get-property-id';

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

jest.mock('../../src/lib/fpti');
jest.mock('../../src/lib/get-property-id');

const generateRandomFPTIInput = () => {
  const event = { ...fptiInput };
  event.eventData = `{"id":  "${ uuidv4() }"}`;
};

describe('test ShoppingEventPublisher publish fpti events', () => {
  beforeEach(() => {
    fetchContainerSettings.mockClear();
    trackFptiV2.mockClear();
  });

  it('should publish FPTI event when container summary is loaded', () => {
    const config = {};
    fetchContainerSettings.mockReturnValue(Promise.resolve(containerSummary));
    const publisher = ShoppingEventPublisher(config);
    publisher.publishFptiEvent(fptiInput);
    setTimeout(
      () => expect(trackFptiV2).toBeCalledWith(config, fptiInput),
      1000
    );
  });

  it('should publish FPTI event as the propertyId is set in the config', () => {
    const config = { propertyId: 'f37af29e-890f-443d-9e61-b797c6a114b7' };
    fetchContainerSettings.mockReturnValue(Promise.resolve(null));
    const publisher = ShoppingEventPublisher(config);
    publisher.publishFptiEvent(fptiInput);
    expect(trackFptiV2).toBeCalledWith(config, fptiInput);
  });

  it('should NOT publish FPTI event failed to fetch container summary', () => {
    const config = {};
    fetchContainerSettings.mockReturnValue(Promise.reject(new Error('test error')));
    const publisher = ShoppingEventPublisher(config);
    publisher.publishFptiEvent(fptiInput);
    setTimeout(() => expect(trackFptiV2).toHaveBeenCalledTimes(0), 1000);
  });

  it('should NOT publish FPTI event when container summary is NOT found', () => {
    const config = {};
    fetchContainerSettings.mockReturnValue(Promise.resolve(null));
    const publisher = ShoppingEventPublisher(config);
    publisher.publishFptiEvent(fptiInput);
    setTimeout(() => expect(trackFptiV2).toHaveBeenCalledTimes(0), 1000);
  });

  it('should NOT publish FPTI event when container summary is empty', () => {
    const config = {};
    fetchContainerSettings.mockReturnValue(Promise.resolve({}));
    const publisher = ShoppingEventPublisher(config);
    publisher.publishFptiEvent(fptiInput);
    setTimeout(() => expect(trackFptiV2).toHaveBeenCalledTimes(0), 1000);
  });

  it('should enqueue message if container is missing', () => {
    const config = {};
    fetchContainerSettings.mockReturnValue(Promise.resolve({}));
    const publisher = ShoppingEventPublisher(config);
    publisher.publishFptiEvent(fptiInput);
    const queue = publisher.getFptiEventsQueue();
    expect(queue).toEqual([ fptiInput ]);
    setTimeout(() => expect(trackFptiV2).toHaveBeenCalledTimes(0), 1000);
  });

  it('should have limit of 100 events to enqueue', () => {
    const config = {};
    fetchContainerSettings.mockReturnValue(Promise.resolve({}));
    const publisher = ShoppingEventPublisher(config);
    
    for (let i = 0; i < 150; i++) {
      const fptiEvent = generateRandomFPTIInput();
      publisher.publishFptiEvent(fptiEvent);
    }
    
    const queue = publisher.getFptiEventsQueue();
    expect(queue.length).toEqual(100);
  });
});
