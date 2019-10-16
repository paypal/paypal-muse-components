/* @flow */
export const mockContainer1 = {
  'id': '475d4fff-dc57-4fd3-a6e2-ae1aa2f1f079',
  'owner_type': 'PAYPAL',
  'owner_id': '759SBALRW3ZTY',
  'integration_type': 'XO',
  'application_context': {
    'bn_code': 'CHECKOUT_BUTTON',
    'partner_name': 'CHECKOUT_BUTTON',
    'merchant_country': 'US'
  },
  'url': 'tomoconnell.dev',
  'published': true,
  'tags': [
    {
      'id': '2eae7800-291c-43d9-976f-9e6953f0e40c',
      'tag_definition_id': 'analytics-xo',
      'enabled': true,
      'configuration': [
        {
          'id': 'analytics-id',
          'name': 'Merchant + website unique analytics tracking id',
          'config_value': '',
          'config_type': 'string',
          'config_required': true,
          'value': '759SBALRW3ZTY-1'
        }
      ],
      'time_created': '2019-10-08T23:28:46.591Z',
      'time_updated': '2019-10-08T23:31:11.032Z'
    },
    {
      'id': '64e55e78-993f-437b-b545-13936e7f7a5c',
      'tag_definition_id': 'offers',
      'enabled': true,
      'configuration': [
        {
          'id': 'analytics-id',
          'name': 'Merchant + website unique analytics tracking id',
          'config_value': '',
          'config_type': 'string',
          'config_required': true,
          'value': '759SBALRW3ZTY-1'
        },
        {
          'id': 'variant',
          'name': 'Variant name',
          'config_value': 'toast',
          'config_type': 'string',
          'config_required': true,
          'value': 'toast'
        },
        {
          'id': 'flow',
          'name': 'Flow name',
          'config_value': 'offer',
          'config_type': 'string',
          'config_required': true,
          'value': 'meteor'
        },
        {
          'id': 'mobile-variant',
          'name': 'Mobile variant name',
          'config_value': 'mobile-toast',
          'config_type': 'string',
          'config_required': true,
          'value': 'mini-slide-up'
        },
        {
          'id': 'mobile-flow',
          'name': 'Mobile flow name',
          'config_value': 'offer',
          'config_type': 'string',
          'config_required': true,
          'value': 'meteor'
        },
        {
          'id': 'limit',
          'name': 'Number of times the credit banner is shown per day',
          'config_value': '3',
          'config_type': 'number',
          'config_required': false,
          'value': '3'
        },
        {
          'id': 'is-mobile-enabled',
          'name': 'Mobile Enabled',
          'config_value': true,
          'config_type': 'boolean',
          'config_required': false,
          'value': 'true'
        },
        {
          'id': 'is-desktop-enabled',
          'name': 'Desktop Enabled',
          'config_value': true,
          'config_type': 'boolean',
          'config_required': false,
          'value': 'true'
        },
        {
          'id': 'offer-program-id',
          'name': 'Offer Program ID',
          'config_value': '',
          'config_type': 'string',
          'config_required': false,
          'value': 'C4ENKKFUEUJ4J'
        },
        {
          'id': 'is-onsite-experience-enabled',
          'name': 'Onsite Experience enabled',
          'config_value': true,
          'config_type': 'boolean',
          'config_required': false,
          'value': 'true'
        }
      ],
      'time_created': '2019-10-08T23:31:11.032Z',
      'time_updated': '2019-10-08T23:31:11.032Z'
    }
  ],
  'time_created': '2019-10-08T23:28:46.591Z',
  'time_updated': '2019-10-08T23:31:11.033Z',
  'links': [
    {
      'rel': 'get',
      'href': 'https://msmaster.qa.paypal.com:22469/v1/offers/containers/475d4fff-dc57-4fd3-a6e2-ae1aa2f1f079',
      'method': 'GET'
    },
    {
      'rel': 'update',
      'href': 'https://msmaster.qa.paypal.com:22469/v1/offers/containers/475d4fff-dc57-4fd3-a6e2-ae1aa2f1f079',
      'method': 'PUT'
    },
    {
      'rel': 'delete',
      'href': 'https://msmaster.qa.paypal.com:22469/v1/offers/containers/475d4fff-dc57-4fd3-a6e2-ae1aa2f1f079',
      'method': 'DELETE'
    },
    {
      'rel': 'add-tag',
      'href': 'https://msmaster.qa.paypal.com:22469/v1/offers/containers/475d4fff-dc57-4fd3-a6e2-ae1aa2f1f079/tags',
      'method': 'POST'
    },
    {
      'rel': 'get-tags',
      'href': 'https://msmaster.qa.paypal.com:22469/v1/offers/containers/475d4fff-dc57-4fd3-a6e2-ae1aa2f1f079/tags',
      'method': 'GET'
    }
  ],
  'sys': {
    'links': {
      'jsBaseUrl': '/tagmanager/js',
      'cssBaseUrl': '/tagmanager/css',
      'templateBaseUrl': '/tagmanager/templates/US/en',
      'resourceBaseUrl': '/tagmanager',
      'originalTemplateBaseUrl': '/tagmanager/templates'
    },
    'pageInfo': {
      'date': 'Oct 8, 2019 16:33:29 -07:00',
      'hostName': 'rZJvnqaaQhLn/nmWT8cSUsC2av9vPD3/nSVKK9CG5lUOuM4ZjhQlnw',
      'rlogId': 'rZJvnqaaQhLn%2FnmWT8cSUnIqeOCL0tUDhRbFiJtwz9JU2svSPnQ0ja%2BcJ%2B%2FEhu5mPb3h%2FUaMkmI_16dadb87129',
      'script': 'node',
      'debug': {
        'scm': 'ERROR: scm info not found in manifest.json'
      }
    },
    'locality': {
      'timezone': {
        'determiner': 'viaCowPrimary',
        'value': 'America/Los_Angeles'
      },
      'country': 'US',
      'locale': 'en_US',
      'language': 'en',
      'directionality': 'ltr'
    },
    'tracking': {
      'fpti': {
        'name': 'pta',
        'jsURL': 'https://www.paypalobjects.com/staging',
        'serverURL': 'https://tracking.qa.paypal.com/webapps/tracking/ts',
        'dataString': 'pgrp=tagmanagernodeweb%2Fpublic%2Ftemplates%2F.dust&page=tagmanagernodeweb%2Fpublic%2Ftemplates%2F.dust&tmpl=tagmanagernodeweb%2Fpublic%2Ftemplates%2F.dust&pgst=1570577609001&calc=084591903b3eb&rsta=en_US&pgtf=Nodejs&s=ci&csci=176304afab2f42c99a15f07945d7ae1e&comp=tagmanagernodeweb&tsrce=tagmanagernodeweb&cu=0'
      }
    }
  }
};

export const mockContainerSummary1 = {
  id: mockContainer1.id,
  integrationType: mockContainer1.integration_type,
  mrid: mockContainer1.owner_id,
  programId: 'C4ENKKFUEUJ4J'
};
