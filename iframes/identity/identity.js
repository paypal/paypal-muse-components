import {fetchVisitorInfo} from './userInfo'
import {fetchUserCountry} from './userCountry'
import constants from "../../src/lib/constants";

const {IDENTITY_MESSAGES} = constants;

window.addEventListener('message', async (e) => {
  if (e.data.type !== IDENTITY_MESSAGES.USER_INFO_REQUEST) {
    return
  }

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
})

window.addEventListener('message', async (e) => {
  const eventName = IDENTITY_MESSAGES.USER_COUNTRY_MESSAGE
  if (e.data.type !== eventName) {
    return
  }
  let country = 'US';
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
    type: eventName,
    payload: country
  }, '*')
})