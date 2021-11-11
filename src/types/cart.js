/* @flow */
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

export type CartData = {|
    cartId? : string,
    items : $ReadOnlyArray<Product>,
    emailCampaignId? : string,
    total? : string,
    cartTotal? : string,
    currencyCode? : string
|};

export type RemoveFromCartData = {|
    cartId? : string,
    cartTotal? : string,
    total? : string,
    currencyCode? : string,
    items : $ReadOnlyArray<{| id : string |}>
|};

export type PurchaseData = {|
    currencyCode? : string,
    cartId : string
|};
