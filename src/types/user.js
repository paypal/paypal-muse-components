/* @flow */
export type UserData = {|
  merchantProvidedUserId? : string,
  id? : string,
  email? : string,
  name? : string,
  first_time_visitor? : boolean
|};

export type IdentityData = {|
    mrid : string,
    onIdentification : Function,
    onError? : Function
|};
