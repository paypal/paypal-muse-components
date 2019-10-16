/* @flow */
type config = {|
  config_required : boolean,
  config_type : string,
  config_value : string,
  id : string,
  name : string,
  value : string
|};

type tag = {|
  configuration : $ReadOnlyArray<config>,
  enabled : boolean,
  id : string,
  tag_definition_id : string,
  time_created : string,
  time_updated : string
|};

/* A JSON description of the different products/tags that are
loaded on a merchant site when pptm is pulled from a script tag. */
export type Container = {|
  /* container id is used as propertyId */
  id : string,
  /* 'xo' or 'manual'. 'xo' containers are created automatically
  for any merchant site that features a smart payment button. */
  integration_type : string,
  /* Merchant encrypted account number */
  owner_id : string,
  /* Array containing different elements to load. */
  tags : $ReadOnlyArray<tag>
|};

export type ContainerSummary = {|
  id : string,
  integrationType : string,
  mrid : string,
  programId : string | null
|};
