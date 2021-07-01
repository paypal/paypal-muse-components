/* global expect jest */
/* @flow */
import { setupUserDetails } from '../../src/lib/user-configuration';
import {
  getOrCreateValidUserId,
  setGeneratedUserId,
  setMerchantProvidedUserId,
  createNewCartId
} from '../../src/lib/local-storage';
import { IdentityManager } from '../../src/lib/iframe-tools/identity-manager';

const mockedUserId = 'ee964537-1c7b-403e-b978-ea29babc5aed';
jest.mock('../../src/lib/local-storage');
jest.mock('../../src/lib/iframe-tools/identity-manager');

describe('sets up user details', () => {
  beforeEach(() => {
    getOrCreateValidUserId.mockClear();
    setMerchantProvidedUserId.mockClear();
    getOrCreateValidUserId.mockReturnValue({ userId: mockedUserId });
  });

  it('should set up user details for empty configuration', () => {
    const config = {};
    setupUserDetails(config);
    expect(IdentityManager).toBeCalledWith(config);
    expect(getOrCreateValidUserId).toHaveBeenCalledTimes(1);
    expect(setMerchantProvidedUserId).toHaveBeenCalledTimes(0);
    expect(config.user.id).toEqual(mockedUserId);
  });

  it('should set up user details for configuration with user details', () => {
    const config = { user: { id: 'test_user' } };
    setupUserDetails(config);
    expect(IdentityManager).toBeCalledWith(config);
    expect(getOrCreateValidUserId).toHaveBeenCalledTimes(1);
    expect(config.user.id).toEqual(mockedUserId);
    expect(setMerchantProvidedUserId).toBeCalledWith('test_user');
    expect(config.user.merchantProvidedUserId).toEqual('test_user');
  });

  it('should set user id when error is thrown', () => {
    getOrCreateValidUserId.mockImplementation(() => {
      throw new Error('test error');
    });
    setGeneratedUserId.mockReturnValue({ userId: mockedUserId });
    const config = {};
    setupUserDetails(config);
    expect(createNewCartId).toHaveBeenCalledTimes(1);
    expect(setGeneratedUserId).toHaveBeenCalledTimes(1);
    expect(config.user.id).toEqual(mockedUserId);
  });
});
