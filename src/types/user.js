/* @flow */
export type UserData = {|
  merchantProvidedUserId? : string,
  id? : string,
  email? : string,
  name? : string,
  first_visit? : boolean,
  user_tags? : $ReadOnlyArray<string>
|};

export type IdentityData = {|
    mrid : string,
    onIdentification : Function,
    onError? : Function
|};

export type VisitorInfo= {|
  confidenceScore: number,
  encryptedAccountNumber: string,
  identificationType: string,
  country: string
|} | null
