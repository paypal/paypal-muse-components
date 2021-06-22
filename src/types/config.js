/* @flow */
import type { UserData  } from './user';
import type { ContainerSummary } from './container';
import type {
  ParamsToBeaconUrl,
  ParamsToTokenUrl,
  ParamsToPropertyIdUrl,
  ParamsToIdentityUrl
} from './util';

export type Config = {|
    user? : UserData,
    propertyId? : string,
    paramsToBeaconUrl? : ParamsToBeaconUrl,
    paramsToIdentityUrl? : ParamsToIdentityUrl,
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
    currencyCode? : string,
    shoppingAttributes? : Object
|};

export type JetloreConfig = {|
    user_id : string,
    cid : string,
    feed_id : string,
    div? : string,
    lang? : string
|};
