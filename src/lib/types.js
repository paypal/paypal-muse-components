/* @flow */

export const TYPES = true;

export type MuseServerConfigType = {|
    assetsUrl : string
|};

export type MuseGlobalType = {|
    serverConfig : MuseServerConfigType
|};

export type TrackingType = 'view' | 'cartEvent' | 'purchase' | 'setUser' | 'cancelCart';

export type CartEventType = 'addToCart' | 'setCart' | 'removeFromCart';

export type Product = {|
    id : string,
    title? : string,
    url? : string,
    description? : string,
    imgUrl? : string,
    otherImages? : $ReadOnlyArray<string>,
    keywords? : $ReadOnlyArray<string>,
    price? : string,
    quantity? : string
|};

export type ViewData = {| page : string, title? : string |};

export type CartData = {|
    cartId? : string,
    items : $ReadOnlyArray<Product>,
    emailCampaignId? : string,
    total? : string,
    cartTotal? : string,
    currencyCode? : string
|};

export type RemoveCartData = {|
    cartId? : string,
    cartTotal? : string,
    total? : string,
    currencyCode? : string,
    items : $ReadOnlyArray<{ id : string }>
|};

export type PurchaseData = {|
    currencyCode? : string,
    cartId : string
|};

export type UserData = {|
    user : {|
        id? : string,
        email? : string,
        name? : string
    |}
|};

export type IdentityData = {|
    mrid : string,
    onIdentification : Function,
    onError? : Function
|};

export type ParamsToBeaconUrl = ({
    trackingType : TrackingType,
    data : ViewData | CartData | RemoveCartData | PurchaseData
}) => string;

export type ParamsToTokenUrl = () => string;

export type ParamsToPropertyIdUrl = () => string;

export type JetloreConfig = {|
    user_id : string,
    cid : string,
    feed_id : string,
    div? : string,
    lang? : string
|};

export type Config = {|
    user? : {|
        id? : string,
        email? : string, // mandatory if unbranded cart recovery
        name? : string
    |},
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
    paramsToPropertyIdUrl? : ParamsToPropertyIdUrl,
    currencyCode? : string
|};

