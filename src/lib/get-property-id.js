/* @flow */
import { getMerchantID, getSDKQueryParam, getPayPalDomain } from '@paypal/sdk-client/src';

import type {
  Config,
  Container,
  ContainerSummary
} from '../types';
import type { ParamsToPropertyIdUrl } from '../types/util';

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
    programId,
    jlAccessToken: container.jlAccessToken
  };
};

const emptyContainer : Container = {
  id: '',
  integration_type: '',
  owner_id: '',
  tags: [],
  jlAccessToken: ''
};

export const getContainerRequestUrl = (merchantId : string, clientId : string, paramsToPropertyIdUrl? : ParamsToPropertyIdUrl) : string => {
  const merchantWebsite = `${ window.location.protocol }//${ window.location.host }`;
  const paypalDomain = getPayPalDomain();
  const baseUrl = paramsToPropertyIdUrl ? paramsToPropertyIdUrl() : `${ paypalDomain }/tagmanager/containers/xo`;

  const requestId = merchantId ? `mrid=${ merchantId }` : `client_id=${ clientId }`;

  return `${ baseUrl }?${ requestId }&url=${ encodeURIComponent(merchantWebsite) }&jlAccessToken=true`;
};

const getContainer = (paramsToPropertyIdUrl? : Function) : Promise<Container> => {
  const merchantId = getMerchantID()[0];

  // $FlowFixMe
  const clientId : string = getSDKQueryParam<string>('client-id');

  if (merchantId || clientId) {
    return fetch(getContainerRequestUrl(merchantId, clientId, paramsToPropertyIdUrl))
      .then(res => {
        if (res.status !== 200) {
          throw new Error(`Failed to fetch propertyId: status ${ res.status }`);
        }

        return res.json();
      });
  }

  return Promise.resolve(emptyContainer);
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

/**
 * Fetch container settings and parse them into custom format before caching
 * in localStorage.
 *
 * Also handles missing propertyId in config by setting it to the returned
 * containers id.
 * @param paramsToPropertyIdUrl
 * @param propertyId
 * @returns {Promise<unknown>|Promise<ContainerSummary>}
 */
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
