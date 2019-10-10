/* @flow */
import { getLogger } from '@paypal/sdk-client/src/logger';
import { FPTI_KEY } from '@paypal/sdk-constants/src';

export const logger = {
  error: (...args) => {
    const loggerObj = getLogger();
    loggerObj.track({
      [FPTI_KEY.ERROR_CODE]: 'paypal-muse-components',
      [FPTI_KEY.ERROR_DESC]: args[0] || 'sdk-client-error'
    });
    loggerObj.error(...args);
  }
};

