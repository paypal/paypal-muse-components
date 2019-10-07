/* @flow */
export default {
  'sevenDays': 1000 * 60 * 60 * 24 * 7,
  'oneMonth': 1000 * 60 * 60 * 24 * 30,
  'accessTokenUrl': 'https://www.paypal.com/muse/api/partner-token',
  'storage': {
    'paypalCrUser': 'paypal-cr-user',
    'paypalCrCart': 'paypal-cr-cart'
  },
  'defaultTrackerConfig': {
    'user': {
      'id': null,
      'email': null,
      'name': null
    }
  }
};
