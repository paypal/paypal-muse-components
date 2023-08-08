export const fetchVisitorInfo = ({ deviceInfo, country }) => {
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

    return fetch(`/targeting/graphql`, fetchOptions)
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