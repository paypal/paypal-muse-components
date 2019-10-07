/* @flow */
export type FptiInput = {|
  // Device height
  deviceHeight? : ?number,
  // Device width
  deviceWidth? : ?number,
  // Browser height
  browserHeight? : ?number,
  // Browser width
  browserWidth? : ?number,
  // Color depth
  colorDepth? : ?number,
  // Screen height
  screenHeight? : ?number,
  // Screen width
  screenWidth? : ?number,
  // Device type
  deviceType? : ?string,
  // Browser type
  browserType? : ?string,
  // Rosetta language
  rosettaLanguage? : ?string,
  // Page domain & path
  location? : ?string,
  // Identification confidence score
  confidenceScore? : ?number,
  // Identification type returned by VPNS
  identifierUsed? : ?string,
  // Unverified encrypted customer account number
  userEAN? : ?string,
  // Analytics identifier associated with the merchant site. XO container id.
  propertyId? : ?string,
  // Event Name
  eventName : string,
  // Event Type
  eventType : string,
  // Event Data
  sinfo? : ?string,
  // Legacy value for filtering events in Herald
  page? : string,
  // Legacy value for filtering events in Herald
  pgrp? : ?string,
  // Application name
  comp? : string,
  // Legacy impression event
  e? : string,
  // Timestamp
  t? : ?Date,
  // Timestamp relative to user
  g? : ?Date
|};

export type FptiVariables = {|
  // Device height
  dh : ?number,
  // Device width
  dw : ?number,
  // Browser height
  bh : ?number,
  // Browser width
  bw : ?number,
  // Color depth
  cd : ?number,
  // Screen height
  sh : ?number,
  // Screen width
  sw : ?number,
  // Device type
  dvis : ?string,
  // Browser type
  btyp : ?string,
  // Rosetta language
  rosetta_language : ?string,
  // Page domain & path
  ru : ?string,
  // Identification confidence score
  confidence_score : ?number,
  // Identification type returned by VPNS
  identifier_used : ?string,
  // Unverified encrypted customer account number
  unverified_cust_id : ?string,
  // Analytics identifier associated with the merchant site. XO container id.
  item : ?string,
  // Merchant encrypted account number
  mrid : ?string,
  // ClientID
  client_id : ?string,
  // Partner AttributionId
  bn_code : ?string,
  // Event Name
  event_name : ?string,
  // Event Type
  event_type : ?string,
  // Event Data
  sinfo : ?string,
  // Legacy value for filtering events in Herald
  page : string,
  // Legacy value for filtering events in Herald
  pgrp : string,
  // Application name
  comp : string,
  // Legacy impression event
  e : string,
  // Timestamp
  t : Date,
  // Timestamp relative to user
  g : Date
|};
