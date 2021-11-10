/* @flow */
import 'whatwg-fetch'; // eslint-disable-line import/no-unassigned-import

import type { Config } from '../types/config';

import { setupTrackers } from './shopping-trackers';
import { setupUserDetails } from './user-configuration';
import { setupContainer } from './get-property-id';
// $FlowFixMe
import { capturePageData } from './tag-parsers/capture-page-data';

// $FlowFixMe
export const shoppingAnalyticsSetup = (config? : Config = {}) => {
  const shoppingTracker = setupTrackers(config);
  let identityFetchCompleted : boolean = false;
  let containerFetchCompleted : boolean = false;
  let eventQueue = [];
  const queue_limit = 100;

  function isReadyToPublish() : boolean {
    return identityFetchCompleted && containerFetchCompleted;
  }

  function flushEventQueueIfReady () {
    if (isReadyToPublish()) {
      for (const params of eventQueue) {
        shoppingTracker.send(...params);
      }
      eventQueue = [];
    }
  }

  function onUserIdentityFetch() {
    identityFetchCompleted = true;
    flushEventQueueIfReady();
  }

  // $FlowFixMe
  function onContainerFetch(containerSummary) {
    config.propertyId = config.propertyId || (containerSummary && containerSummary.id);
    config.containerSummary = containerSummary;
    containerFetchCompleted = true;
    flushEventQueueIfReady();
  }

  function enqueueEvent(...args) {
    eventQueue.push(args);
    if (eventQueue.length > queue_limit) {
      eventQueue.shift();
    }
  }

  // $FlowFixMe
  function sendOrEnqueue(...args) {
    if (!isReadyToPublish()) {
      enqueueEvent(...args);
    } else {
      shoppingTracker.send(...args);
    }
  }

  setupUserDetails(config, onUserIdentityFetch);
  setupContainer(config, onContainerFetch);

  return {
    send: sendOrEnqueue,
    set: shoppingTracker.set,
    getPageSkuData: capturePageData,
    onUserIdentityFetch,
    onContainerFetch
  };
};
