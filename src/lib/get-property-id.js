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
  let programId;

  if (offerTag && offerTag.configuration) {
    programId = offerTag.configuration.filter(config => config.id === 'offer-program-id')[0];
    programId = programId ? programId.value : null;
  } else {
    programId = null;
  }

  return {
    id: container.id,
    integrationType: container.integration_type,
    mrid: container.owner_id,
    programId
  };
};

const emptyContainer : Container = {
  id: '',
  integration_type: '',
  owner_id: '',
  tags: []
};

const getContainer = (paramsToPropertyIdUrl? : Function) : Promise<Container> => {
  const merchantId = getMerchantID()[0];

  if (merchantId) {
    const currentLocation = `${ window.location.protocol }//${ window.location.host }`;
    const url = paramsToPropertyIdUrl ? paramsToPropertyIdUrl() : 'https://www.paypal.com/tagmanager/containers/xo';

    return fetch(`${ url }?mrid=${ merchantId }&url=${ encodeURIComponent(currentLocation) }&jlAccessToken=true`)
      .then(res => {
        if (res.status !== 200) {
          throw new Error(`Failed to fetch propertyId: status ${ res.status }`);
        }

        return res.json();
      });
  } else {
    return Promise.resolve(emptyContainer);
  }
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
      return '';
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
      // $FlowFixMe
      return '';
    });
};
