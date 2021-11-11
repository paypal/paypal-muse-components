/* @flow */
import type {
  EventType
} from './events';

export type ParamsToBeaconUrl = ({|
    trackingType : EventType,
    data : any
|}) => string;

export type ParamsToTokenUrl = () => string;

export type ParamsToPropertyIdUrl = () => string;

export type ParamsToIdentityUrl = () => string;

export const TYPES = true;

export type MuseServerConfigType = {|
    assetsUrl : string
|};

export type MuseGlobalType = {|
    serverConfig : MuseServerConfigType
|};
