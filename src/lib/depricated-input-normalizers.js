export const setUserNormalizer = (input) => {
  if (input) {
    if (input.user) {
      // eslint-disable-next-line no-console
      console.warn('the "user" key has been depricated. See v2 documentation for details')
      return input.user
    }
  }

  return input
}

/* sets cartTotal to total. Warns in the event a 'depricated' value is passed */
export const addToCartNormalizer = (input) => {
  if (input) {
    if (input.total !== undefined) {
      // eslint-disable-next-line no-console
      console.warn('"total" has been depricated. use "cartTotal" instead')
    } else if (input.cartTotal) {
      input.total = input.cartTotal
      delete input.cartTotal
    }
  }

  return input
}

export const purchaseNormalizer = addToCartNormalizer
export const setCartNormalizer = addToCartNormalizer
export const removeFromCartNormalizer = addToCartNormalizer