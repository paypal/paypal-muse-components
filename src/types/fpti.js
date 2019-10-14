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

/* Workaround for the sake of supporting the 'legacy' store cash implementation. See 'StoreCashVariables' */
export type StoreCashInput = {|

|}

/* Workaround for the sake of supporting the 'legacy' store cash implementation. 'legacy'
store cash works via 3 different 'types' of fpti events:
  - An event that fires at the time a user views a page with an SPB. This begins a potential 'dropoff'.
  Currently the SDK is firing this via a 'customEvent' whenever a merchant wants, regardless if there's a
  SPB present or not.
  - A 'purchase' event at the time a customer completes a transaction.
  - An event when a merchant can identify a customer.

These events follow a completely different format from the rest of the events fired by the SDK.
They will be removed at some point in the future.
*/
export type StoreCashVariables = {|
  // Legacy value for filtering events in Herald
  page : string,
  // Legacy value for filtering events in Herald
  pgrp : string,
  // Traffic source
  tsrce: string,
  // Application name
  comp : string,
  // Source identifier ("component" in fpti team's terms)
  sub_component: string,
  // Originating source (client / server side)
  s: string,
  // Item originating the track ("container/propertyId in this context")
  item: string,
  // "Flow" Type (totally irrelevant boilerplate related to the UI in this context - see musenodeweb for details)
  fltp: string,
  // Impression event name ("event subtype" in FPTI team's terms)
  es: string,
  // Merchant encrypted account number
  mrid : string,
  // Partner BN Code
  code: string,
  // Partner Name
  partner_name: string,
  // page title
  pt: string,
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
  // Js client version
  v: string,
  // Browser plugins
  pl: string,
  // Rosetta language
  rosetta_language : string,
  // Store cash campaign offer program id
  offer_id: string,
  // 'event type' (will always be 'im'/impression in this context)
  e: string,
  // Timestamp
  t : Date,
  // Timestamp relative to user
  g : Date,
  // Page domain, path & querystring
  completeurl: string
|}