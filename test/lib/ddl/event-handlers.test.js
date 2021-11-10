/* global expect jest */
/* @flow */
import { createEventHandler } from '../../../src/lib/ddl/event-handlers';

const setMock = jest.fn();
const sendMock = jest.fn();

const shoppingAnalytics = {
  send: sendMock,
  set: setMock
};

describe('test eventTracker setup', () => {
  beforeEach(() => {
    setMock.mockClear();
    sendMock.mockClear();
  });

  it('should handle send event', () => {
    const event = { event: 'page_view', payload: { type: 'Test' } };
    const handler = createEventHandler(shoppingAnalytics);
    handler.consume(event);
    expect(sendMock).toBeCalledWith(event.event, event.payload);
    expect(setMock).not.toHaveBeenCalled();
  });

  it('should handle set event', () => {
    const event = { set: { currency: 'USD' } };
    const handler = createEventHandler(shoppingAnalytics);
    handler.consume(event);
    expect(sendMock).not.toHaveBeenCalled();
    expect(setMock).toBeCalledWith(event.set);
  });

  it('should skip unknown event', () => {
    const event = { testUnknown: 1 };
    const handler = createEventHandler(shoppingAnalytics);
    handler.consume(event);
    expect(sendMock).not.toHaveBeenCalled();
    expect(setMock).not.toHaveBeenCalled();
  });
});
