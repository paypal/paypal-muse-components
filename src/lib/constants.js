/* @flow */
export const defaultTrackerConfig = {
  user: {
    id: '',
    email: '',
    name: '',
    country: ''
  }
};

export const IDENTITY_MESSAGES = {
  FETCH_ERROR: 'fetch_identity_error',
  USER_INFO_REQUEST: 'fetch_identity_request',
  USER_COUNTRY_MESSAGE: 'fetch_identity_country'
};

export default {
  'oneHour': 1000 * 60 * 60,
  'sevenDays': 1000 * 60 * 60 * 24 * 7,
  'oneMonth': 1000 * 60 * 60 * 24 * 30,
  'cartLimit': 10,
  'accessTokenUrl': 'https://www.paypal.com/muse/api/partner-token',
  'storage': {
    'paypalCrUser': 'paypal-cr-user',
    'paypalCrCart': 'paypal-cr-cart',
    'paypalCrPropertyId': 'paypal-cr-propid',
    'paypalCrContainer': 'paypal-cr-container',
    'paypalSDKIdentity': 'paypal-sdk-identity'
  },
  defaultTrackerConfig
};
