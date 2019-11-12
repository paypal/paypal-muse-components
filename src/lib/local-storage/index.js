/* @flow */
export { getCartId,
  setCartId,
  createNewCartId,
  getOrCreateValidCartId
} from './cart';

export {
  getUserStorage,
  setUserStorage,
  setGeneratedUserId,
  setMerchantProvidedUserId,
  getUserId,
  getOrCreateValidUserId
} from './user';

export { getPropertyId, setPropertyId } from './property-id';

export { setContainer, getValidContainer } from './container';

export { setIdentity, getIdentity, clearIdentity } from './identity';
