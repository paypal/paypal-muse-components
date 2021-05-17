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
    product_id : string,
    product_name? : string,
    category? : Category,
    price? : string,
    currency? : string,
    url? : string,
    brand?: string,
    user? : UserData
|};
