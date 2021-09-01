/* global expect jest */
/* @flow */
import { createEventHandler } from '../../../src/lib/ddl/event-handlers';
import { setupShoppingDDL } from '../../../src/lib/ddl/shopping-ddl';

jest.mock('../../../src/lib/ddl/event-handlers');
const consumeMock = jest.fn();
const shoppingAnalytics = {};
const event1 = { event: 'page_view', payload: { type: 'Test' } };
const event2 = { event: 'page_view', payload: { type: 'Test2' } };


describe('test eventTracker setup', () => {
  beforeEach(() => {
    createEventHandler.mockClear();
    createEventHandler.mockReturnValue({
      consume: consumeMock
    });
    consumeMock.mockClear();
  });

  it('should process events in the window.shoppingDDL', () => {
    const window = { shoppingDDL: [ event1 ] };
    setupShoppingDDL(window, shoppingAnalytics);
    expect(consumeMock).toBeCalledWith(event1);
    expect(window.shoppingDDL.length).toEqual(0);

    window.shoppingDDL.push(event2);
    expect(consumeMock).toBeCalledWith(event2);
    expect(window.shoppingDDL.length).toEqual(0);
  });


  it('should process events after window.shoppingDDL is overwritten', () => {
    const window = { shoppingDDL: [] };
    setupShoppingDDL(window, shoppingAnalytics);
    expect(window.shoppingDDL.length).toEqual(0);

    window.shoppingDDL.push(event1);
    expect(consumeMock).toBeCalledWith(event1);
    expect(window.shoppingDDL.length).toEqual(0);
  });
});
