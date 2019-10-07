/* @flow */
export type UserData = {|
  merchantProvidedUserId? : string,
  id? : string,
  email? : string,
  name? : string
|};

export type IdentityData = {|
    mrid : string,
    onIdentification : Function,
    onError? : Function
|};
