/* @flow */
import { getLogger } from '@paypal/sdk-client/src/logger';
import { noop, stringifyError, stringifyErrorMessage } from '@krakenjs/belter/src';
import { FPTI_KEY } from '@paypal/sdk-constants/src';

export const logger = {
  error: (name : string, errInfo : Object) => {
    try {
      const loggerObj = getLogger();
      loggerObj.track({
        [FPTI_KEY.ERROR_CODE]: 'paypal-muse-components',
        [FPTI_KEY.ERROR_DESC]: JSON.stringify({
          name,
          error: stringifyErrorMessage(errInfo)
        })
      });
      loggerObj.error(name, {
        err: stringifyError(errInfo)
      });
      loggerObj.flush().catch(noop); // fire immediately
    } catch (err) {

      // Should not deviate from logger.js
      // https://github.com/paypal/paypal-sdk-client/blob/1da04d91df71851d1ff3a15ece659d3d944e4f3f/src/logger.js
      const loggerObj = getLogger();
      loggerObj.track({
        [FPTI_KEY.ERROR_CODE]: 'paypal-muse-components',
        [FPTI_KEY.ERROR_DESC]: `Error logging error event for ${ name || '' }`
      });
      loggerObj.error('logger_error', {
        err: stringifyError(err)
      });
      loggerObj.flush().catch(noop); // fire immediately
    }
  }
};

