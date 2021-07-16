/* @flow */
import 'whatwg-fetch'; // eslint-disable-line import/no-unassigned-import

import type { Config } from '../types/config';
import type { UserData } from '../types';

import { setupTrackers } from './shopping-trackers';
import { setupUserDetails } from './user-configuration';

type AnalyticsEvent = [string, Object];

export const shoppingAnalyticsSetup = (config : Config) => {
  const shoppingTracker = setupTrackers(config);
  let identityFetchCompleted : boolean = false;
  let eventQueue : Array<AnalyticsEvent> = [];

  function flushEventQueue () {
    for (const params of eventQueue) {
      shoppingTracker.send(...params);
    }
    eventQueue = [];
  }

  function onUserIdentityFetch(user : UserData) {
    config.user = { ...config.user, ...user };

    identityFetchCompleted = true;
    flushEventQueue();
  }

  function enqueueEvent(...args : AnalyticsEvent) {
    eventQueue.push(args);
  }

  function sendOrEnqueue(...args : AnalyticsEvent) {
    if (!identityFetchCompleted) {
      enqueueEvent(...args);
    } else {
      shoppingTracker.send(...args);
    }
  }

  setupUserDetails(config).then(onUserIdentityFetch);

  return {
    onUserIdentityFetch,
    viewPage: shoppingTracker.viewPage,
    viewProduct: shoppingTracker.viewProduct,
    send: sendOrEnqueue,
    set: shoppingTracker.set,
    autoGenerateProductPayload: shoppingTracker.autoGenerateProductPayload
  };
};
