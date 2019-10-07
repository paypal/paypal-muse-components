/* @flow */
export type EventType = 'view' | 'cartEvent' | 'purchase' | 'setUser' | 'cancelCart';

// subset of 'EventType' specific to 'cartEvent'
export type CartEventType = 'addToCart' | 'setCart' | 'removeFromCart';
