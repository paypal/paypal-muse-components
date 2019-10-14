import { sendBeacon, filterFalsyValues } from '../fpti'

const resolveTrackingData = () => {
  return {}
}

const resolveTrackingVariables = () => ({

})

export const storeCashFpti = (config, data) => {
  const fptiServer = 'https://t.paypal.com/ts';
  const trackingVariables = resolveTrackingVariables(resolveTrackingData(config, data));

  sendBeacon(fptiServer, filterFalsyValues(trackingVariables));
}