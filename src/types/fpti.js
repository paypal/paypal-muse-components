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
  identificationType? : ?string,
  // Unverified encrypted customer account number
  encryptedAccountNumber? : ?string,
  // Analytics identifier associated with the merchant site. XO container id.
  propertyId? : ?string,
  // Event Name
  eventName : string,
  // Event Type
  eventType : string,
  // Event Data
  eventData? : ?string,
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
  g? : ?Date,
  // Cart ID
  cartId? : string,
  // SDK generated user ID
  shopperId? : string,
  // Merchant provided user ID
  merchantProvidedUserId? : string,
  
  es? : string,

  fltp? : string,

  offer_id? : string,

  sub_flow? : string,

  flag_consume? : string,

  item? : string
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
  ru? : string,
  // Identification confidence score
  confidence_score? : number,
  // Identification confidence score
  unsc? : number,
  // Identification type returned by VPNS
  identifier_used : ?string,
  // Unverified encrypted customer account number
  unverified_cust_id? : string,
  // encrypted customer account number
  cust? : string,
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
  event_type? : string,
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
  g : Date,
  // Cart ID
  merchant_cart_id : string,
  // SDK generated user ID
  shopper_id : string,
  // Merchant provided user ID
  external_id : string,

  // Constant: ppshopping (switchboard filter)
  product : string,

  es? : string,

  fltp? : string,

  offer_id? : string,

  completeurl? : string,

  sub_component? : string,

  sub_flow? : string,

  mru? : string,

  flag_consume? : string
  
|};

/* Workaround for the sake of supporting legacy analytics implementation.
These events follow a completely different format from the rest of the events fired by the SDK.
They will be removed at some point in the future.
*/
export type LegacyVariables = {|
  // Legacy value for filtering events in Herald
  page : string,
  // Legacy value for filtering events in Herald
  pgrp : string,
  // Traffic source
  tsrce : string,
  // Application name (MUST be "tagmanagernodeweb" in this context)
  comp : string,
  // Source identifier ("component" in fpti team's terms)
  sub_comp : string,
  // Originating source (client / server side)
  s : string,
  // Item originating the track ("container/propertyId in this context")
  item : string,
  // "Flow" Type
  fltp : string,
  // Impression event name ("event subtype" in FPTI team's terms)
  es : string,
  // Merchant encrypted account number
  mrid : string,
  // Partner BN Code
  code? : string,
  // Partner Name
  partner_name? : string,
  // page title
  pt : string,
  // Device height
  dh : number,
  // Device width
  dw : number,
  // Browser height
  bh : number,
  // Browser width
  bw : number,
  // Color depth
  cd : number,
  // Screen height
  sh : number,
  // Screen width
  sw : number,
  // Js client version (NA by default in our case)
  v : string,
  // Browser plugins
  pl : string,
  // Browser type
  btyp : string,
  // Device type
  dvis : string,
  // Rosetta language
  rosetta_language : string,
  // offer program id
  offer_id : string,
  // 'event type' (will always be 'im'/impression in this context)
  e : string,
  // Timestamp
  t : Date,
  // Timestamp relative to user
  g : Date,
  // Page domain, path & querystring
  completeurl : string,
  // 'merchant recognized user'
  mru? : boolean,
  // client side event
  cs : number
|};
