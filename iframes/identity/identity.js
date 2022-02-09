import {fetchVisitorInfo} from './userInfo'
import {fetchUserCountry} from './userCountry'
import constants from "../../src/lib/constants";

const {IDENTITY_MESSAGES, defaultCountry} = constants;

window.addEventListener('message', async (e) => {
  switch (e.data.type) {
    case IDENTITY_MESSAGES.USER_INFO_REQUEST: {
      await userInfoRequest(e)
      break
    }

    case IDENTITY_MESSAGES.USER_COUNTRY_MESSAGE: {
      await userCountryRequest()
      break
    }
    default:
      return
  }
})

const userInfoRequest = async (e) => {
  try {
    const visitorInfo = await fetchVisitorInfo(e.data.payload)
    window.parent.postMessage({
      type: IDENTITY_MESSAGES.USER_INFO_REQUEST,
      payload: visitorInfo
    }, '*')
  } catch (err) {
    // surface error to parent window
    window.parent.postMessage({
      type: IDENTITY_MESSAGES.FETCH_ERROR,
      payload: err
    }, '*')

    window.parent.postMessage({
      type: IDENTITY_MESSAGES.USER_INFO_REQUEST,
      payload: {}
    }, '*')
  }
}

const userCountryRequest = async () => {
  let country = defaultCountry;
  try {
    country = await fetchUserCountry()

  } catch (err) {
    // surface error to parent window
    window.parent.postMessage({
      type: IDENTITY_MESSAGES.FETCH_ERROR,
      payload: err
    }, '*')
  }

  window.parent.postMessage({
    type: IDENTITY_MESSAGES.USER_COUNTRY_MESSAGE,
    payload: country
  }, '*')
}