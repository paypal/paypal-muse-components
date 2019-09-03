const getType = (input) => {
  if (Array.isArray(input)) {
    return 'array'
  }

  if (input === null) {
    return 'null'
  }

  return typeof input
}

// Performs 'typeof' check on every key in 'input'
const checkRequiredKeys = (input, expectedInput) => {
  // input must be an object
  if (getType(input) !== 'object') {
    throw new Error(`Input error: expected ${getType(input)} to be object`)
  }

  for (var key in expectedInput) {
    const expected = expectedInput[key]
    const actual = getType(input[key])

    if (actual !== expected) {
      throw new Error(`Input error for ${key}: expected ${actual} to be ${expected}`)
    }
  }
}

// Performs 'typeof' check on every key in 'input' that exists
const checkOptionalKeys = (input, expectedInput) => {
  // input must be an object
  if (getType(input) !== 'object') {
    throw new Error(`Input error: expected ${getType(input)} to be object`)
  }


  for (var key in expectedInput) {
    const expected = expectedInput[key]
    const actual = getType(input[key])

    if (actual !== 'undefined' && actual !== expected) {
      throw new Error(`Input error for ${key}: expected ${actual} to be ${expected}`)
    }
  }
}

const checkArrayKeys = (input, expectedInput) => {
  // input must be an array
  if (getType(input) !== 'array') {
    throw new Error(`Input error: expected ${getType(input)} to be array`)
  }

  input.forEach(inputItem => checkRequiredKeys(inputItem, expectedInput))
}

const checkArrayOptionalKeys = (input, expectedInput) => {
  // input must be an array
  if (getType(input) !== 'array') {
    throw new Error(`Input error: expected ${getType(input)} to be array`)
  }

  input.forEach(inputItem => checkOptionalKeys(inputItem, expectedInput))
}

export const validateAddItems = input => {
  const requiredInputKeys = {
    items: 'array'
  }

  const optionalInputKeys = {
    cartId: 'string',
  }

  const requiredItemKeys = {
    id: 'string', 
    title: 'string', 
    url: 'string', 
    imgUrl: 'string', 
    price: 'string'
  }

  const optionalItemKeys = {
    quantity: 'number',
    keywords: 'array',
    otherImages: 'array',
    description: 'string'
  }

  checkRequiredKeys(input, requiredInputKeys)
  checkOptionalKeys(input, optionalInputKeys)
  checkArrayKeys(input.items, requiredItemKeys)
  checkArrayOptionalKeys(input.items, optionalItemKeys)
}

export const validateRemoveItems = input => {
  const requiredInputKeys = {
    items: 'array'
  }

  const optionalInputKeys = {
    cartId: 'string',
  }

  const requiredItemKeys = {
    id: 'string',
  }

  const optionalItemKeys = {
    quantity: 'number',
  }

  checkRequiredKeys(input, requiredInputKeys)
  checkOptionalKeys(input, optionalInputKeys)
  checkArrayKeys(input.items, requiredItemKeys)
  checkArrayOptionalKeys(input.items, optionalItemKeys)
};

export const validateUser = input => {
  const optionalInputKeys = {
    id: 'string',
    email: 'string',
    name: 'string',
    user: 'object',
  }

  const optionalUserKeys = {
    id: 'string',
    email: 'string',
    name: 'string',
  }

  checkOptionalKeys(input, optionalInputKeys)

  if (input.user) {
    checkOptionalKeys(input.user, optionalUserKeys)
  }
};