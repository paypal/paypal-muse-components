/* @flow */

export type EventType = 'pageView' | 'productView' | 'page_view' | 'product_view' | 'purchase' | 'store_cash_exclusion' | 'custom_event';

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
