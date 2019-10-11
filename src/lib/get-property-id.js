/* @flow */
import { getMerchantID } from '@paypal/sdk-client/src';

import type {
  Config,
  Container,
  ContainerSummary
} from '../types';

import { getPropertyId, setPropertyId, setContainer, getValidContainer } from './local-storage';
import { logger } from './logger';

/* Takes the full container and transforms it into
a format better suited for use by the SDK */
const parseContainer = (container : Container) : ContainerSummary => {
  const offerTag = container.tags.filter(tag => tag.tag_definition_id === 'offers')[0];
  let storeCashProgramId;

  if (offerTag && offerTag.configuration) {
    storeCashProgramId = offerTag.configuration.filter(config => config.id === 'offer-program-id')[0];
    storeCashProgramId = storeCashProgramId ? storeCashProgramId.value : null;
  } else {
    storeCashProgramId = null;
  }

  return {
    id: container.id,
    integrationType: container.integration_type,
    mrid: container.owner_id,
    storeCashProgramId
  };
};

const getContainer = (paramsToPropertyIdUrl? : Function) : Promise<Container> => {
  const merchantId = getMerchantID()[0];

  const currentLocation = `${ window.location.protocol }//${ window.location.host }`;
  const url = paramsToPropertyIdUrl ? paramsToPropertyIdUrl() : 'https://www.paypal.com/tagmanager/containers/xo';

  return fetch(`${ url }?mrid=${ merchantId }&url=${ encodeURIComponent(currentLocation) }`)
    .then(res => {
      if (res.status !== 200) {
        throw new Error(`Failed to fetch propertyId: status ${ res.status }`);
      }

      return res.json();
    });
};

export const fetchPropertyId = ({ paramsToPropertyIdUrl, propertyId } : Config) : Promise<string> => {
  const cachedPropertyId = getPropertyId();

  if (cachedPropertyId) {
    return Promise.resolve(cachedPropertyId.propertyId);
  }

  return getContainer(paramsToPropertyIdUrl)
    .then(parseContainer)
    .then(containerSummary => {
      // save to localstorage
      setContainer(containerSummary);

      if (propertyId) {
        setPropertyId(propertyId);
      } else {
        setPropertyId(containerSummary.id);
      }

      return containerSummary.id;
    })
    .catch((err) => {
      logger.error('getContainer', err);
    });
};

export const fetchContainerSettings = ({ paramsToPropertyIdUrl, propertyId } : Config) : Promise<ContainerSummary> => {
  const cachedContainer = getValidContainer();

  if (cachedContainer) {
    return Promise.resolve(cachedContainer);
  }

  return getContainer(paramsToPropertyIdUrl)
    .then(parseContainer)
    .then(containerSummary => {
      // save to localstorage
      setContainer(containerSummary);

      if (propertyId) {
        setPropertyId(propertyId);
      } else {
        setPropertyId(containerSummary.id);
      }

      return containerSummary;
    })
    .catch((err) => {
      logger.error('getContainer', err);
    });
};
