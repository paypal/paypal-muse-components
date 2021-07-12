/* @flow */
import type { FptiInput, Config, ContainerSummary } from '../../types';
import { fetchContainerSettings } from '../get-property-id';
import { logger } from '../logger';

import { trackFpti } from './shopping-fpti';

/**
 * The FPTI event may only be published if merchant XO container is setup and fetched from tagmanager service.
 * The merchant XO container is fetched by merchant id and URL at the initialization of the ShoppingEventPublisher instance.
 * Once the container is fetched, config.propertyId is set to container id.
 * Note, the container fetch is async call, hence, ShoppingAnalytics tracker may already be used to publish analytics events,
 * if the container load is still in progress, messages could be dropped.
 * To prevent message loss, ShoppingEventPublisher has a queueng mechanism, where messages are stored while XO container is being loaded.
 *
 */
export const ShoppingEventPublisher = (config : Config) => {
  const fptiEventsQueue = [];
  const queue_limit = 100;

  /**
   * The FPTI event may only be published if merchant XO container is setup and fetched from tagmanager service.
   * Once the container is fetched, config.propertyId is set to container id.
   * This method returns boolean config.propertyId is populated.
   * @returns {boolean}
   */
  function isAllowedToPublishEvent() : boolean {
    // const isContainerIdSet =
    //   config.propertyId !== undefined &&
    //   config.propertyId !== null &&
    //   config.propertyId.length > 0;
    // return isContainerIdSet;
    return true;
  }

  /**
   * Enqueue FPTI event for later processing. There is a limit of how many events we can enqueue.
   * If the queue is full the queue will start droping events.
   * It could happen that the container is no container or there is failure to retreieve one.
   * @param {string} fptiEvent fpti event to enqueue
   */
  function enqueueFptiEvent(fptiEvent : FptiInput) {
    fptiEventsQueue.push(fptiEvent);
    if (fptiEventsQueue.length > queue_limit) {
      fptiEventsQueue.shift();
    }
  }
  /**
   * This function conditionally publishes the fpti event to FPTI.
   * If the container is present the event is published, otherwise it is queued up.
   * @param {string} fptiEvent - an FPTI event to pulblish
   */
  function publishFptiEvent(fptiEvent : FptiInput) {
    if (isAllowedToPublishEvent()) {
      trackFpti(fptiEvent);
    } else {
      enqueueFptiEvent(fptiEvent);
    }
  }

  function processFptiEventsQueue() {
    fptiEventsQueue.forEach((fptiEvent) => {
      publishFptiEvent(fptiEvent);
    });
    fptiEventsQueue.length = 0;
  }

  function initializeContainer() {
    function onContainerLoad(containerSummary? : ContainerSummary) {
      config.propertyId =
        config.propertyId || (containerSummary && containerSummary.id);
      config.containerSummary = containerSummary;
      processFptiEventsQueue();
    }

    fetchContainerSettings(config)
      .then(onContainerLoad)
      .catch((err) => {
        logger.error('failed to fetch container', err);
      });
  }

  // $FlowFixMe
  function getFptiEventsQueue() : [] {
    return fptiEventsQueue;
  }

  initializeContainer();

  return { publishFptiEvent, getFptiEventsQueue };
};
