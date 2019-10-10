/* @flow */
import type { UserData  } from './user';
import type { ContainerSummary } from './container';
import type {
  ParamsToBeaconUrl,
  ParamsToTokenUrl,
  ParamsToPropertyIdUrl
} from './util';

export type Config = {|
    user? : UserData,
    propertyId? : string,
    paramsToBeaconUrl? : ParamsToBeaconUrl,
    paramsToTokenUrl? : ParamsToTokenUrl,
    jetlore? : {|
        user_id : string,
        access_token : string,
        feed_id : string,
        div? : string,
        lang? : string
    |},
    containerSummary? : ContainerSummary | null,
    paramsToPropertyIdUrl? : ParamsToPropertyIdUrl,
    currencyCode? : string
|};

export type JetloreConfig = {|
    user_id : string,
    cid : string,
    feed_id : string,
    div? : string,
    lang? : string
|};
