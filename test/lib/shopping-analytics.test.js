/* global expect jest */
/* @flow */
import { setupTrackers } from '../../src/lib/shopping-trackers';
import { shoppingAnalyticsSetup } from '../../src/lib/shopping-analytics';

jest.mock('../../src/lib/shopping-trackers');
const setMock = jest.fn();
const sendMock = jest.fn();
const config = {};

describe('test eventTracker setup', () => {
  beforeEach(() => {
    setupTrackers.mockClear();
    setupTrackers.mockReturnValue({
      set: setMock,
      send: sendMock
    });
    setMock.mockClear();
    sendMock.mockClear();
  });
  
  it('should enqueue event if identity has not updated status', () => {
    const shopping = shoppingAnalyticsSetup(config);
    shopping.send('page_view', {});
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('should send events after identity has updated status', () => {
    const shopping = shoppingAnalyticsSetup(config);
    shopping.send('page_view', { id: 1 });
    shopping.send('page_view', { id: 2 });
    expect(sendMock).not.toHaveBeenCalled();

    shopping.onUserIdentityFetch('user');
    expect(sendMock).toHaveBeenCalledTimes(2);

    const sendCall1 = sendMock.mock.calls[0];
    expect(sendCall1[0]).toBe('page_view');
    expect(JSON.stringify(sendCall1[1])).toBe(JSON.stringify({ id: 1 }));
  });

  it('should send event if identity already set status', () => {
    const shopping = shoppingAnalyticsSetup(config);
    shopping.onUserIdentityFetch('user');

    shopping.send('page_view', { id: 1 });
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toBeCalledWith('page_view', { id: 1 });
  });


  it('should pass set to Shopping tracker', () => {
    const shopping = shoppingAnalyticsSetup(config);
    shopping.set({ currency: 'USD' });
    expect(setMock).toBeCalledWith({ currency: 'USD' });
  });

});
