const env = process.env.NODE_ENV
// local targetingnodeweb instance (optional for developing locally)
const localTargetingUrl = process.env.TARGETING_URL

let targetingUrl

switch (env) {
  case 'development':
    if (localTargetingUrl) {
      targetingUrl = localTargetingUrl
      break
    }
  case 'staging':
    targetingUrl = 'https://www.msmaster.qa.paypal.com/targeting/qraphql'
    break;
  case 'sandbox':
    targetingUrl = 'https://www.sandbox.paypal.com/targeting/graphql'
  case 'production':
  default:
    targetingUrl = 'https://www.paypal.com/targeting/graphql'
    break;
}

const fetchVisitorInfo = ({ deviceInfo, country }) => {
  const encodedDeviceInfo = encodeURIComponent(JSON.stringify(deviceInfo))

  const fetchOptions = {
    method: 'POST',
    credentials: 'include',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `{ visitorInfo(
        country: "${country}",
        deviceInfo: "${encodedDeviceInfo}"
      ) }`
    })
  }

  return fetch(targetingUrl, fetchOptions)
    .then(res => {
      if (res.status !== 200) {
        throw new Error(`targeting responded with statuscode ${res.status}`)
      }

      return res.json()
    })
    .then(json => {
      if (!json || !json.data || !json.data.visitorInfo) {
        throw new Error('response missing required fields')
      }

      return json.data.visitorInfo
    })
}

window.addEventListener('message', async (e) => {
  if (e.data.type !== 'fetch_identity_request') {
    return
  }

  try {
    const visitorInfo = await fetchVisitorInfo(e.data.payload)
    window.parent.postMessage({
      type: 'fetch_identity_response',
      payload: visitorInfo
    }, '*')
  } catch (err) {
    // surface error to parent window
    window.parent.postMessage({
      type: 'fetch_identity_error',
      payload: err
    }, '*')
  }
})