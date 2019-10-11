/* @flow */
export type EventType = 'view' | 'cartEvent' | 'purchase' | 'setUser' | 'cancelCart' | 'customEvent';

// subset of 'EventType' specific to 'cartEvent'
export type CartEventType = 'addToCart' | 'setCart' | 'removeFromCart';
