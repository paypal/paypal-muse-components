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

  return fetch('/targeting/graphql', fetchOptions)
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