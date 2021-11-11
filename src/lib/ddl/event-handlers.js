/* @flow */
const noop = (e) => e === undefined;

type EventHandlerType = {|
  id : string,
  predicate : (e : Object) => boolean,
  handle : (e : Object) => void
|};

export const buildEventHandlers = (shoppingAnalytics : any) : $ReadOnlyArray<EventHandlerType> =>  {
  const shoppingSendEventHandler : EventHandlerType = {
    id: 'send_event_handler',
    predicate: (e) => {
      return e.event !== undefined;
    },
    handle: (e) => {
      if (e.event !== 'snippetRun') {
        shoppingAnalytics.send(e.event, e.payload);
      }
    }
  };

  const configurationEventHandler : EventHandlerType = {
    id: 'set_handler',
    predicate: (e) => {
      return e.set !== undefined;
    },
    handle: (e) => {
      shoppingAnalytics.set(e.set);
    }
  };

  return [
    shoppingSendEventHandler,
    configurationEventHandler
  ];
};

export type EventConsumerType = {|
  consume : (e : Object) => void
|};

export const createEventHandler = (shoppingAnalytics : any) : EventConsumerType => {
  const handlers = buildEventHandlers(shoppingAnalytics);
  const findEventHandler = (e) => {
    function handlerMatch(handler) : boolean {
      return handler.predicate(e);
    }
    const handler = handlers.filter(handlerMatch);
    return handler[0] !== undefined ? handler[0].handle : noop;
  };

  const consume = (e : Object) => {
    const handler = findEventHandler(e);
    handler(e);
  };
  return {
    consume
  };
};
