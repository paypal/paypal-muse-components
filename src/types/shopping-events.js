/* @flow */

import type { UserData  } from './user';

export type EventType = 'pageView' | 'productView' | 'purchase' | 'setUser' | 'cancelCart' | 'customEvent';
export type PageType = 'HOME_PAGE' | 'CATEGORY' | 'SEARCH_RESULTS' | 'DEALS' | 'CART' | 'CHECKOUT' | 'ORDER_CONFIRMATION';

export type Category = {|
    id : string,
    name? : string
|};

export type PageView = {|
    id? : string,
    page_type? : PageType,
    name? : string,
    category? : Category,
    user? : UserData
|};

export type ProductView = {|
    product_id : string, // the product id or SKU
    product_name? : string,
    category? : Category,
    price? : string, // eg 200.00
    currency? : string, // ISO code
    url? : string,
    brand? : string, // product brand
    user? : UserData
|};
