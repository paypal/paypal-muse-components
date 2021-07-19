/* @flow */
export type UserData = {|
  merchantProvidedUserId? : string,
  id? : string,
  email? : string,
  name? : string,
  first_visit? : boolean,
  user_tags? : $ReadOnlyArray<string>,
  country? : string
|};

export type UserStorage= {|
  merchantProvidedUserId? : string,
  userId? : string,
  email? : string | null,
  name? : string | null,
  first_visit? : boolean,
  user_tags? : $ReadOnlyArray<string>,
  country? : string
|} | {||};

export type IdentityData = {|
    mrid : string,
    onIdentification : Function,
    onError? : Function
|};
