/* @flow */
import { getMerchantID } from '@paypal/sdk-client/src';

import type {
  Config,
  Container
} from '../types';

import { getPropertyId, setPropertyId } from './local-storage';


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

export const fetchPropertyId = ({ paramsToPropertyIdUrl } : Config) : Promise<string> => {
  const cachedPropertyId = getPropertyId();

  if (cachedPropertyId) {
    return Promise.resolve(cachedPropertyId.propertyId);
  }

  return getContainer(paramsToPropertyIdUrl)
    .then(container => {
      // save to localstorage
      setPropertyId(container.id);

      return container.id;
    })
    .catch(() => {
      // doing nothing for now since there's no logging
      return '';
    });
};

export const getContainerSettings = () : any => {
  return {};
};
