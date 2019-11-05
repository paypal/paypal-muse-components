const env = process.env.NODE_ENV
let targetingUrl

switch (env) {
  case 'staging':
  case 'development':
    targetingUrl = 'https://www.msmaster.qa.paypal.com/targeting/qraphql'
    break;
  case 'sandbox':
    targetingUrl = 'https://www.sandbox.paypal.com/targeting/graphql'
  case 'production':
  default:
    targetingUrl = 'https://www.paypal.com/targeting/graphql'
    break;
}

const fetchVisitorInfo = (data) => {
  const deviceInfo = encodeURIComponent(JSON.stringify(data.deviceInfo))
  const country = data.country

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
        deviceInfo: "${deviceInfo}"
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
  if (e.source.window !== window.parent.window) {
    return
  }

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
    //surface error in some way
  }
})