/* global expect jest */
/* @flow */
import { createEventHandler } from '../../../src/lib/ddl/event-handlers';

const setMock = jest.fn();
const sendMock = jest.fn();
const autoGenerateProductPayloadMock = jest.fn();

const shoppingAnalytics = {
  send: sendMock,
  set: setMock,
  autoGenerateProductPayload: autoGenerateProductPayloadMock
};

describe('test eventTracker setup', () => {
  beforeEach(() => {
    setMock.mockClear();
    sendMock.mockClear();
    autoGenerateProductPayloadMock.mockClear();
  });

  it('should handle send event', () => {
    const event = { event: 'page_view', payload: { type: 'Test' } };
    const handler = createEventHandler(shoppingAnalytics);
    handler.consume(event);
    expect(sendMock).toBeCalledWith(event.event, event.payload);
    expect(setMock).not.toHaveBeenCalled();
    expect(autoGenerateProductPayloadMock).not.toHaveBeenCalled();
  });

  it('should handle set event', () => {
    const event = { set: { currency: 'USD' } };
    const handler = createEventHandler(shoppingAnalytics);
    handler.consume(event);
    expect(sendMock).not.toHaveBeenCalled();
    expect(setMock).toBeCalledWith(event.set);
    expect(autoGenerateProductPayloadMock).not.toHaveBeenCalled();
  });

  it('should handle autoGenerateProductPayload event', () => {
    const event = { autoGenerateProductPayload: 'true' };
    const handler = createEventHandler(shoppingAnalytics);
    handler.consume(event);
    expect(sendMock).not.toHaveBeenCalled();
    expect(setMock).not.toHaveBeenCalled();
    expect(autoGenerateProductPayloadMock).toBeCalledWith(event);
  });

  it('should skip unknown event', () => {
    const event = { testUnknown: 1 };
    const handler = createEventHandler(shoppingAnalytics);
    handler.consume(event);
    expect(sendMock).not.toHaveBeenCalled();
    expect(setMock).not.toHaveBeenCalled();
    expect(autoGenerateProductPayloadMock).not.toHaveBeenCalled();
  });
});
