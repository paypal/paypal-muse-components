/* @flow */
import 'whatwg-fetch'; // eslint-disable-line import/no-unassigned-import

import type { Config } from '../types/config';

import { setupTrackers } from './shopping-trackers';

// $FlowFixMe
export const shoppingAnalyticsSetup = (config? : Config = {}) => {
  const shoppingTracker = setupTrackers(config);
  let identityFetchCompleted : boolean = false;
  let eventQueue = [];

  function flushEventQueue () {
    for (const params of eventQueue) {
      shoppingTracker.send(...params);
    }
    eventQueue = [];
  }

  // $FlowFixMe
  function onUserIdentityFetch() {
    identityFetchCompleted = true;
    flushEventQueue();
  }

  // $FlowFixMe
  function enqueueEvent(...args) {
    eventQueue.push(args);
  }

  // $FlowFixMe
  function sendOrEnqueue(...args) {
    if (!identityFetchCompleted) {
      enqueueEvent(...args);
    } else {
      shoppingTracker.send(...args);
    }
  }

  return {
    onUserIdentityFetch,
    viewPage: shoppingTracker.viewPage,
    send: sendOrEnqueue,
    set: shoppingTracker.set,
    autoGenerateProductPayload: shoppingTracker.autoGenerateProductPayload
  };
};
