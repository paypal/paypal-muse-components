/* @flow */
const { expect } = global;

export const config = {
  containerSummary: {
    programId: 'A87KPP4KFVC8J',
    mrid: 'JTJ8GTMKP7V3A',
    id: '91388d62-3964-43be-a022-a5ff76d43798',
    applicationContext: {}
  }
};

export const deviceInfo = {
  deviceWidth: 123,
  deviceHeight: 125,
  screenWidth: 300,
  screenHeight: 400,
  colorDepth: 24,
  rosettaLanguage: 'en-US',
  location: 'test.business.us',
  deviceType: 'Desktop',
  browserHeight: 100,
  browserWidth: 300
};

export const identity = {
  confidenceScore: 100,
  identificationType: 'RMUC',
  encryptedAccountNumber: 'CY26RACMGXKQL'
};

export const generatedUserIds = {
  userId: 'ee964537-1c7b-403e-b978-ea29babc5aed',
  merchantProvidedUserId: '4328f923-3293-4b24-a069-d3c0bc2a0375'
};

export function verifyEventMappings(fptiEvent, eventAttribs) {
  Object.keys(eventAttribs).forEach(attrib => {
    expect(fptiEvent[attrib]).toEqual(eventAttribs[attrib]);
  });
}


export function verifyMainFptiAttributes(fptiEvent, eventAttribs) {
  Object.keys(eventAttribs).forEach(attrib => {
    expect(fptiEvent[attrib]).toEqual(eventAttribs[attrib]);
  });
}

export function verifyFptiIdentityMappings(fptiEvent, identityData) {
  expect(fptiEvent.confidenceScore).toEqual(identityData.confidenceScore);
  expect(fptiEvent.encryptedAccountNumber).toEqual(
    identityData.encryptedAccountNumber
  );
  expect(fptiEvent.identificationType).toEqual(identityData.identificationType);
}

export function verifyFptiDeviceInfoMappings(fptiEvent, deviceInfoInput) {
  expect(fptiEvent.deviceWidth).toEqual(deviceInfoInput.deviceWidth);
  expect(fptiEvent.deviceHeight).toEqual(deviceInfoInput.deviceHeight);
  expect(fptiEvent.screenWidth).toEqual(deviceInfoInput.screenWidth);
  expect(fptiEvent.screenHeight).toEqual(deviceInfoInput.screenHeight);
  expect(fptiEvent.colorDepth).toEqual(deviceInfoInput.colorDepth);
  expect(fptiEvent.rosettaLanguage).toEqual(deviceInfoInput.rosettaLanguage);
  expect(fptiEvent.location).toEqual(deviceInfoInput.location);
  expect(fptiEvent.deviceType).toEqual(deviceInfoInput.deviceType);
  expect(fptiEvent.browserHeight).toEqual(deviceInfoInput.browserHeight);
  expect(fptiEvent.browserWidth).toEqual(deviceInfoInput.browserWidth);
}

export function verifyFptiAttributes(fptiEvent, additionalAttributes) {
  for (const [ key, value ] of Object.entries(additionalAttributes)) {
    expect(fptiEvent[key]).toEqual(value);
  }
}
