/* @flow */
/* global afterAll expect jest */
import { setContainer, setGeneratedUserId } from '../../src/lib/local-storage';
import { Tracker } from '../../src/tracker-component';
import { mockContainerSummary1 } from '../mocks';
import { logger } from '../../src/lib/logger';
import { trackFpti } from '../../src/lib/fpti';

jest.mock('../../src/lib/fpti');

jest.mock('../../src/lib/get-property-id', () => {
  return {
    fetchContainerSettings: async () => mockContainerSummary1
  };
});

describe('customEvent', () => {
  const mockUserId = setGeneratedUserId().userId;
  logger.error = jest.fn();
  let config;

  beforeEach(() => {
    setContainer(mockContainerSummary1);

    config = {
      user: {
        id: 'arglebargle123',
        name: 'Bob Ross',
        email: 'bossrob21@pbs.org'
      }
    };

    const xhrMockObj = {
      open: jest.fn(),
      send: jest.fn(),
      setRequestHeader: jest.fn(),
      readyState: 4,
      status: 200,
      addEventListener: jest.fn()
    };

    window.XMLHttpRequest = jest.fn().mockImplementation(() => xhrMockObj);
  });

  afterEach(() => {
    trackFpti.mockReset();
    logger.error.mockReset();
  });

  afterAll(() => {
    window.localStorage.clear();
  });

  it('should trigger a call to fpit', (done) => {
    const tracker = Tracker(config);

    setTimeout(() => {
      tracker.customEvent('user_gets_upset');
      tracker.customEvent('user_yells_at_monitor');

      // called 3 times due to the sdk calling 'pageView' on init
      expect(trackFpti).toHaveBeenCalledTimes(3);
      done();
    }, 50);
  });

  it('should pass along data in fpti sinfo', (done) => {
    const customConfig = {
      propertyId: 'arglebargle',
      user: {
        'email': 'frank@unremarkableemail.com',
        'name': 'Frank',
        'id': mockUserId
      }
    };

    const tracker = Tracker(customConfig);

    const eventData = {
      guests: 25,
      hasPiñata: false,
      shouldHavePiñata: true,
      salsaFlavors: [ 'mild', 'green', 'unknown' ]
    };

    const expectedConfig = {
      ...customConfig,
      'currencyCode': 'USD',
      'containerSummary': mockContainerSummary1
    };

    const expectedEventData = {
      eventName: 'taco_party',
      eventType: 'customEvent',
      eventData
    };

    setTimeout(() => {
      tracker.customEvent('taco_party', eventData);

      expect(trackFpti).toHaveBeenCalledTimes(2);
      expect(trackFpti).toHaveBeenCalledWith(expectedConfig, expectedEventData);
      done();
    }, 50);
  });

  it('should throw when invalid input is passed as an argument', () => {
    const tracker = Tracker(config);

    try {
      tracker.customEvent(undefined, 'you should really read the docs');
    } catch (err) {
      expect(logger.error).toHaveBeenCalledTimes(1);
    }

  });
});
