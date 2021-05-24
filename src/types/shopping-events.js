/* @flow */

import type { UserData  } from './user';

export type EventType = 'pageView' | 'productView' | 'purchase' | 'setUser' | 'cancelCart' | 'customEvent';
export type PageType = 'HOME' | 'CATEGORY' | 'SEARCH_RESULTS' | 'DEALS' | 'PRODUCT' | 'CART' | 'CHECKOUT' | 'ORDER_CONFIRMATION';

export type Category = {|
    id : string,
    name? : string,
    subcategory_id?: string, 
    subcategory_name?: string, 
|};

export type PageView = {|
    id? : string,
    page_type? : PageType,
    name? : string,
    category? : Category,
    user? : UserData
|};

export type ProductView = {|
    product_id : string, // the product id 
    sku_id? : string, // SKU Id
    product_name? : string,
    category? : Category,
    price? : string, // eg 200.00
    currency? : string, // ISO code
    url? : string,
    brand? : string, // product brand
    user? : UserData
|};
