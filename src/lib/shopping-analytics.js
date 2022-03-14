/* @flow */
import 'whatwg-fetch'; // eslint-disable-line import/no-unassigned-import

import type { Config } from '../types/config';
import type { ContainerSummary } from '../types';

import { setupTrackers } from './shopping-trackers';
import { setupUserDetails } from './user-configuration';
import { setupContainer } from './get-property-id';
// $FlowFixMe
import { capturePageData } from './tag-parsers/capture-page-data';
import { debugLogger } from './debug-console-logger';

// $FlowFixMe
export const shoppingAnalyticsSetup = (config : Config = {}) => {
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
    debugLogger.log('[shopping-analytics:onUserIdentityFetch] Received identity fetch notification.');
    identityFetchCompleted = true;
    flushEventQueueIfReady();
  }

  // $FlowFixMe
  function onContainerFetch(containerSummary : ContainerSummary) : void  {
    debugLogger.log('[shopping-analytics:onUserIdentityFetch] Received container fetch notification. Container summary: ', containerSummary);
    config.propertyId = config.propertyId || (containerSummary && containerSummary.id);
    config.containerSummary = containerSummary;
    containerFetchCompleted = true;
    flushEventQueueIfReady();
  }

  function enqueueEvent(...args) {
    debugLogger.log('[shopping-analytics:enqueueEvent] Event is enqueued (wating on initialization). Event(s):', args);
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
  
  debugLogger.log('[shopping-analytics:shoppingAnalyticsSetup] Initialized shopping analytics with the following configuration', config);

  setupUserDetails(config, onUserIdentityFetch);
  setupContainer(config, onContainerFetch);

  // return publicly accessible
  return {
    send: sendOrEnqueue,
    set: shoppingTracker.set,
    getPageSkuData: capturePageData,
    enableDebugLogging: () => { debugLogger.setDebugEnabled(true); },
    disableDebugLogging: () => { debugLogger.setDebugEnabled(false); }
  };
};
