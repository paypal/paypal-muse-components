/* @flow */
import { createEventHandler } from './event-handlers';

const snippetRunEvent = { event: 'snippetRun', t: new Date().getTime() };
export const DDL_NAME = 'shoppingDDL';

const _getDDL = (w) => {
  let ddl = w[DDL_NAME];

  if (!ddl) {
    ddl = [ snippetRunEvent ];
  }

  return ddl;
};

export const setupShoppingDDL = (w : any, shoppingAnalytics : any) => {
  const unprocessedEvents = [];
  const eventHandler = createEventHandler(shoppingAnalytics);

  const processEvents = () => {
    while (unprocessedEvents.length) {
      const event = unprocessedEvents.shift();
      eventHandler.consume(event);
    }
  };

  const shoppingDDL = _getDDL(w);
  unprocessedEvents.push.apply(unprocessedEvents, shoppingDDL);
  // $FlowFixMe
  shoppingDDL.push = (...args) => {
    unprocessedEvents.push(...args);
    processEvents();
  };
  shoppingDDL.length = 0;

  processEvents();
  return {
    unprocessedEvents,
    shoppingDDL
  };
};
