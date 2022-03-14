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
loaded on a merchant site when container loaded from tag-manager. */
export type Container = {|
  /* container id is used as propertyId */
  id : string,
  /* 'xo' or 'manual'. 'xo' containers are created automatically
  for any merchant site that features a smart payment button. */
  integration_type : string,
  /* Merchant encrypted account number */
  owner_id : string,
  /* Array containing different elements to load. */
  tags : $ReadOnlyArray<tag>,
  jlAccessToken : string | null,
  application_context : {|
    limit_url_capture : boolean | void,
    disable_pptm_bundle : boolean | void
  |}
|};

export type ContainerSummary = {|
  id : string,
  integrationType : string,
  mrid : string,
  programId : string | null,
  jlAccessToken : string | null,
  applicationContext : {|
    limitUrlCapture : boolean,
    disablePptmBundle : boolean
  |}
|};
