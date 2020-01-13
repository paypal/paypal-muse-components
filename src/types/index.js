/* @flow */
export type { FptiVariables, FptiInput, LegacyVariables } from './fpti';
export type { EventType, CartEventType } from './events';
export type { Config, JetloreConfig } from './config';
export type { UserData, IdentityData } from './user';
export type { CartData, Product, RemoveFromCartData, PurchaseData } from './cart';
export type { MuseServerConfigType, MuseGlobalType } from './util';
export type { Container, ContainerSummary } from './container';
export type ConfigManager = {|
  getConfig(): Promise<any>,
  setupUserAndCart(): any,
  checkDebugMode(): any,
  setupConfigUser(): any,
  setImplicitPropertyId(): any,
  setCartId(string): Promise<any>,
  setCart({}): Promise<any>,
  viewPage(): Promise<any>,
  addToCart({}): Promise<any>,
  removeFromCart({}): Promise<any>,
  purchase(string): Promise<any>,
  cancelCart(string): Promise<any>,
  setUser({}): Promise<any>,
  setPropertyId(string): Promise<any>,
  customEvent(string, {}): Promise<any>,
  deprecatedTrack(string, {}): Promise<any>,
  setupJL({}): Promise<any>,
  getIdentity(): Promise<any>,
  getUserAccessToken(): Promise<any>
|};
