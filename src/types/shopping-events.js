/* @flow */

export type EventType = 'pageView' | 'productView' | 'purchase' | 'setUser' | 'cancelCart' | 'customEvent';

export type PageView = {|
    id? : string,
    page_type? : string,
    name? : string,
    category? : string
|};

export type ProductView = {|
    product_id : string, // the product id
    sku_id? : string, // SKU Id
    product_name? : string,
    category? : string,
    price? : string, // eg 200.00
    currency? : string, // ISO code
    url? : string,
    brand? : string // product brand
|};
