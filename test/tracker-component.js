/* globals describe before after afterEach it */
/* @flow */

import { expect } from 'chai';

import { Tracker } from '../src/tracker-component';
import { setCookie } from '../src/lib/cookie-utils';
// $FlowFixMe
import generateIdModule from '../src/generate-id';

const decode = (encodedDataParam : string) : string => {
    return JSON.parse(atob(decodeURIComponent(encodedDataParam)));
};

const extractDataParam = (url : string) : string => {
    return decode(
        (url.match(/\?data=(.+)$/) || [
            '',
            encodeURIComponent(btoa(JSON.stringify({})))
        ])[1]
    );
};

// $FlowFixMe
describe('paypal.Tracker', () => {
    let appendChildCalls = 0;
    const appendChild = () => {
        appendChildCalls += 1;
    };
    let fetchCalls = [];
    window.fetch = (url, options) => {
        fetchCalls.push([ url, options ]);
        return Promise.resolve({
            url,
            body:   options.body,
            status: 200,
            json:   () => ({ hello: 'hi' })
        });
    };

    const deviceInfo = {
        screenWidth:    '1000',
        screenHeight:   '750',
        colorDepth:     '300',
        deviceType:     'desktop',
        browserHeight:  '400',
        browserWidth:   '400'
    };

    const imgMock = {
        src:              '',
        style:            {},
        addEventListener: () => {
            /* empty */
        }
    };

    const createElement = (elementType : string) => {
        // $FlowFixMe
        expect(elementType).to.equal('img');
        return imgMock;
    };

    // $FlowFixMe
    const originalDocumentBodyAppendChild = document.body.appendChild;
    // $FlowFixMe
    const originalDocumentCreateElement = document.createElement;
    const originalGenerateId = generateIdModule.generateId;
    before(() => {
        const deviceLib = require('../src/lib/get-device-info');
        // $FlowFixMe
        deviceLib.getDeviceInfo = () => deviceInfo;
        // $FlowFixMe
        document.body.appendChild = appendChild;
        // $FlowFixMe
        document.createElement = createElement;
        // $FlowFixMe
        generateIdModule.generateId = () => 'abc123';
        // generateIdModule.set(() => 'abc123');
    });

    // $FlowFixMe
    after(() => {
        // $FlowFixMe
        document.body.appendChild = originalDocumentBodyAppendChild;
        // $FlowFixMe
        document.createElement = originalDocumentCreateElement;
        // $FlowFixMe
        generateIdModule.generateId = originalGenerateId;
    });

    // $FlowFixMe
    afterEach(() => {
        appendChildCalls = 0;
        imgMock.src = '';
        window.localStorage.removeItem('paypal-cr-cart');
        document.cookie = 'paypal-cr-cart=;';
        fetchCalls = [];
    });

    // $FlowFixMe
    it('should be a function that returns a tracker', () => {
        const tracker = Tracker();
        expect(tracker).to.have.property('view');
        expect(tracker).to.have.property('addToCart');
        expect(tracker).to.have.property('setCart');
        expect(tracker).to.have.property('removeFromCart');
        expect(tracker).to.have.property('purchase');
        expect(tracker).to.have.property('track');
        expect(tracker).to.have.property('getIdentity');
    });

    it('should clear stored cart content if cart is expired', () => {
        const beforeStorage = window.localStorage.getItem('paypal-cr-cart');

        window.localStorage.setItem('paypal-cr-cart-expiry', Date.now() - 10);

        expect(beforeStorage).to.equal(null);

        // Since the expiry is in the past, this initialization should clear
        // the cart and expiry.
        Tracker();

        const afterStorage = window.localStorage.getItem('paypal-cr-cart');
        const afterExpiry = window.localStorage.getItem('paypal-cr-cart-expiry');

        expect(afterStorage).to.equal(null);
        expect(afterExpiry).to.equal(null);
    });

    it('should migrate cart cookie storage to localStorage when adding an item to cart', () => {
        const products = [
            {
                id:  '1',
                url: 'example.com'
            },
            {
                id:  '2',
                url: 'example.com'
            },
            {
                id:  '3',
                url: 'example.com'
            },
            {
                id:  '4',
                url: 'example.com'
            }
        ];

        document.cookie = `paypal-cr-cart=${ JSON.stringify({ items: [
            products[0],
            products[1]
        ] }) }`;

        const tracker = Tracker();

        tracker.addToCart({ items: [
            products[2],
            products[3]
        ] });

        expect(window.localStorage.getItem('paypal-cr-cart')).equal(JSON.stringify({
            items: products
        }));
    });

    it('should send addToCart events', () => {
        const email = '__test__email3@gmail.com';
        const userName = '__test__userName3';
        const tracker = Tracker({ user: { email, name: userName } });
        expect(appendChildCalls).to.equal(0);
        tracker.addToCart({
            cartId: '__test__cartId',
            items:  [
                {
                    id:  '__test__productId',
                    url: 'https://example.com/__test__productId'
                }
            ],
            emailCampaignId: '__test__emailCampaignId',
            total:           '12345.67',
            currencyCode:    'USD'
        });
        expect(JSON.stringify(extractDataParam(imgMock.src))).to.equal(
            JSON.stringify({
                cartId: '__test__cartId',
                items:  [
                    {
                        id:  '__test__productId',
                        url: 'https://example.com/__test__productId'
                    }
                ],
                emailCampaignId: '__test__emailCampaignId',
                total:           '12345.67',
                currencyCode:    'USD',
                cartEventType:   'addToCart',
                user:            {
                    email: '__test__email3@gmail.com',
                    name:  '__test__userName3',
                    id:    'abc123'
                },
                trackingType: 'cartEvent',
                clientId:     'abcxyz123',
                merchantId:   'xyz,hij,lmno',
                deviceInfo
            })
        );
        expect(appendChildCalls).to.equal(1);
        tracker.addToCart({
            cartId: '__test__cartId0',
            items:  [
                {
                    id:  '__test__productId0',
                    url: 'https://example.com/__test__productId0'
                }
            ],
            emailCampaignId: '__test__emailCampaignId0',
            total:           '102345.67',
            currencyCode:    'USD'
        });
        expect(JSON.stringify(extractDataParam(imgMock.src))).to.equal(
            JSON.stringify({
                cartId: '__test__cartId0',
                items:  [
                    {
                        id:  '__test__productId',
                        url: 'https://example.com/__test__productId'
                    },
                    {
                        id:  '__test__productId0',
                        url: 'https://example.com/__test__productId0'
                    }
                ],
                emailCampaignId: '__test__emailCampaignId0',
                total:           '102345.67',
                currencyCode:    'USD',
                cartEventType:   'addToCart',
                user:            {
                    email: '__test__email3@gmail.com',
                    name:  '__test__userName3',
                    id:    'abc123'
                },
                trackingType: 'cartEvent',
                clientId:     'abcxyz123',
                merchantId:   'xyz,hij,lmno',
                deviceInfo
            })
        );
    });

    it('should send setCart events', () => {
        const email = '__test__email4@gmail.com';
        const userName = '__test__userName4';
        const tracker = Tracker({ user: { email, name: userName } });
        expect(appendChildCalls).to.equal(0);
        tracker.addToCart({
            cartId: '__test__cartId0',
            items:  [
                {
                    id:  '__test__productId0',
                    url: 'https://example.com/__test__productId0'
                }
            ],
            emailCampaignId: '__test__emailCampaignId0',
            total:           '102345.67',
            currencyCode:    'USD'
        });
        tracker.setCart({
            cartId: '__test__cartId',
            items:  [
                {
                    id:  '__test__productId',
                    url: 'https://example.com/__test__productId'
                }
            ],
            emailCampaignId: '__test__emailCampaignId',
            total:           '12345.67',
            currencyCode:    'USD'
        });
        expect(JSON.stringify(extractDataParam(imgMock.src))).to.equal(
            JSON.stringify({
                cartId: '__test__cartId',
                items:  [
                    {
                        id:  '__test__productId',
                        url: 'https://example.com/__test__productId'
                    }
                ],
                emailCampaignId: '__test__emailCampaignId',
                total:           '12345.67',
                currencyCode:    'USD',
                cartEventType:   'setCart',
                user:            {
                    email: '__test__email4@gmail.com',
                    name:  '__test__userName4',
                    id:    'abc123'
                },
                trackingType: 'cartEvent',
                clientId:     'abcxyz123',
                merchantId:   'xyz,hij,lmno',
                deviceInfo
            })
        );
        expect(appendChildCalls).to.equal(2);
    });

    it('should send removeFromCart events', () => {
        const email = '__test__email5@gmail.com';
        const userName = '__test__userName5';
        const tracker = Tracker({ user: { email, name: userName } });
        expect(appendChildCalls).to.equal(0);
        tracker.removeFromCart({
            cartId: '__test__cartId',
            items:  [
                {
                    id:  '__test__productId',
                    url: 'https://example.com/__test__productId'
                }
            ]
        });
        expect(JSON.stringify(extractDataParam(imgMock.src))).to.equal(
            JSON.stringify({
                cartId: '__test__cartId',
                items:  [
                    {
                        id:  '__test__productId',
                        url: 'https://example.com/__test__productId'
                    }
                ],
                cartEventType: 'removeFromCart',
                user:          {
                    email: '__test__email5@gmail.com',
                    name:  '__test__userName5',
                    id:    'abc123'
                },
                trackingType: 'cartEvent',
                clientId:     'abcxyz123',
                merchantId:   'xyz,hij,lmno',
                deviceInfo
            })
        );
        expect(appendChildCalls).to.equal(1);
    });

    it('should send purchase events', () => {
        const email = '__test__email6@gmail.com';
        const userName = '__test__userName6';
        const tracker = Tracker({ user: { email, name: userName } });
        expect(appendChildCalls).to.equal(0);
        tracker.purchase({
            cartId: '__test__cartId'
        });
        expect(JSON.stringify(extractDataParam(imgMock.src))).to.equal(
            JSON.stringify({
                cartId: '__test__cartId',
                user:   {
                    email: '__test__email6@gmail.com',
                    name:  '__test__userName6',
                    id:    'abc123'
                },
                trackingType: 'purchase',
                clientId:     'abcxyz123',
                merchantId:   'xyz,hij,lmno',
                deviceInfo
            })
        );
        expect(appendChildCalls).to.equal(1);
    });

    it('should call paramsToBeaconUrl to create the url if you pass in paramsToBeaconUrl function', () => {
        const userName = '__test__userName6';
        let calledArgs;
        const paramsToBeaconUrl = (...args) => {
            calledArgs = args;
            return 'https://example.com/picture';
        };
        const tracker = Tracker({
            user: { email: '__test__email@gmail.com', name: userName },
            paramsToBeaconUrl
        });
        expect(appendChildCalls).to.equal(0);
        tracker.purchase({
            cartId: '__test__cartId'
        });
        expect(imgMock.src).to.equal('https://example.com/picture');
        expect(appendChildCalls).to.equal(1);
        expect(JSON.stringify(calledArgs)).to.deep.equal(
            JSON.stringify([
                {
                    trackingType: 'purchase',
                    data:         {
                        cartId: '__test__cartId',
                        user:   {
                            email: '__test__email@gmail.com',
                            name:  '__test__userName6',
                            id:    'abc123'
                        },
                        trackingType: 'purchase',
                        clientId:     'abcxyz123',
                        merchantId:   'xyz,hij,lmno',
                        deviceInfo
                    }
                }
            ])
        );
    });

    it('should set the user', () => {
        const userName = '__test__userName9';
        const email = '__test__email9';
        const tracker = Tracker();
        expect(appendChildCalls).to.equal(0);
        tracker.setUser({ user: { name: userName, email } });
        expect(appendChildCalls).to.equal(1);
        expect(JSON.stringify(extractDataParam(imgMock.src))).to.equal(
            JSON.stringify({
                oldUserId: 'abc123',
                user:      {
                    email: '__test__email9',
                    name:  '__test__userName9',
                    id:    'abc123'
                },
                trackingType: 'setUser',
                clientId:     'abcxyz123',
                merchantId:   'xyz,hij,lmno',
                deviceInfo
            })
        );
    });

    it('should allow you to instantiate a user and then set the user', () => {
        const tracker = Tracker({
            user: {
                email: '__test__oldEmail333@gmail.com'
            }
        });
        expect(appendChildCalls).to.equal(0);
        tracker.setUser({
            user: {
                email: '__test__email@gmail.com',
                name:  '__test__name'
            }
        });
        expect(appendChildCalls).to.equal(1);
        const dataParamObject = extractDataParam(imgMock.src);
        // $FlowFixMe
        expect(JSON.stringify(dataParamObject)).to.equal(
            JSON.stringify({
                oldUserId: 'abc123',
                user:      {
                    email: '__test__email@gmail.com',
                    name:  '__test__name',
                    id:    'abc123'
                },
                trackingType: 'setUser',
                clientId:     'abcxyz123',
                merchantId:   'xyz,hij,lmno',
                deviceInfo
            })
        );
    });

    it('should send last user set with setUser', () => {
        const tracker = Tracker();
        tracker.setUser({
            user: { email: '__test__email1', name: '__test__name1' }
        });
        tracker.setUser({ user: { email: '__test__email2' } });
        tracker.addToCart({
            cartId: '__test__cartId',
            items:  [
                {
                    id:  '__test__productId',
                    url: 'https://example.com/__test__productId'
                }
            ],
            emailCampaignId: '__test__emailCampaignId',
            total:           '12345.67',
            currencyCode:    'USD'
        });
        const dataParamObject = extractDataParam(imgMock.src);
        // $FlowFixMe
        expect(JSON.stringify(dataParamObject)).to.equal(
            JSON.stringify({
                cartId: '__test__cartId',
                items:  [
                    {
                        id:  '__test__productId',
                        url: 'https://example.com/__test__productId'
                    }
                ],
                emailCampaignId: '__test__emailCampaignId',
                total:           '12345.67',
                currencyCode:    'USD',
                cartEventType:   'addToCart',
                user:            {
                    email: '__test__email2',
                    name:  '__test__name1',
                    id:    'abc123'
                },
                trackingType: 'cartEvent',
                clientId:     'abcxyz123',
                merchantId:   'xyz,hij,lmno',
                deviceInfo
            })
        );
    });

    it('should use document.cookie value if it exists', () => {
        setCookie('paypal-user-id', '__test__cookie-id', 10000);
        const tracker = Tracker();
        tracker.addToCart({
            cartId: '__test__cartId',
            items:  [
                {
                    id:  '__test__productId',
                    url: 'https://example.com/__test__productId'
                }
            ],
            emailCampaignId: '__test__emailCampaignId',
            total:           '12345.67',
            currencyCode:    'USD'
        });
        const dataParamObject = extractDataParam(imgMock.src);
        // $FlowFixMe
        expect(JSON.stringify(dataParamObject)).to.equal(
            JSON.stringify({
                cartId: '__test__cartId',
                items:  [
                    {
                        id:  '__test__productId',
                        url: 'https://example.com/__test__productId'
                    }
                ],
                emailCampaignId: '__test__emailCampaignId',
                total:           '12345.67',
                currencyCode:    'USD',
                cartEventType:   'addToCart',
                user:            { id: '__test__cookie-id' },
                trackingType:    'cartEvent',
                clientId:        'abcxyz123',
                merchantId:      'xyz,hij,lmno',
                deviceInfo
            })
        );
    });

    it('should hit partner-token route when identify method is invoked', done => {
        const email = '__test__email3@gmail.com';
        const userName = '__test__userName3';
        const tracker = Tracker({ user: { email, name: userName } });
        tracker.identify(data => {
            try {
                const params = fetchCalls.pop();
                expect(params[0]).to.equal('https://paypal.com/muse/api/partner-token');
                expect(params[1].body).to.equal(JSON.stringify({
                    merchantId: 'xyz',
                    clientId:   'abcxyz123'
                }));
                expect(data).to.deep.equal({
                    hello:   'hi',
                    success: true
                });
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it('should hit partner-token route defined with paramsToTokenUrl when identify method is invoked', done => {
        const email = '__test__email3@gmail.com';
        const userName = '__test__userName3';
        const tokenUrl = 'www.blah.xyz';
        const tracker = Tracker({
            user:             { email, name: userName },
            paramsToTokenUrl: () => tokenUrl
        });
        tracker.identify(data => {
            try {
                const params = fetchCalls.pop();
                expect(params[0]).to.equal(tokenUrl);
                expect(data).to.deep.equal({
                    hello:   'hi',
                    success: true
                });
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it('should return promise from identify call', done => {
        const email = '__test__email3@gmail.com';
        const userName = '__test__userName3';
        const tracker = Tracker({ user: { email, name: userName } });
        try {
            tracker.identify().then(data => {
                expect(data).to.deep.equal({
                    hello:   'hi',
                    success: true
                });
                done();
            });
        } catch (err) {
            done(err);
        }
    });

    it('should call getIdentity function with url passed in', done => {
        const email = '__test__email3@gmail.com';
        const userName = '__test__userName3';
        const tracker = Tracker({ user: { email, name: userName } });

        const data = {
            mrid:             'NA4JBW4FWCUQL',
            onIdentification: identityData => identityData
        };
        const url = 'https://www.paypal.com/muse/api/partner-token';
        const result = tracker.getIdentity(data, url).then(accessToken => {
            expect(result).to.be.a('promise');
            expect(accessToken).to.be.an('object');
            done();
        });
    });

    it('should call getIdentity function with no url passed in', done => {
        const email = '__test__email3@gmail.com';
        const userName = '__test__userName3';
        const tracker = Tracker({ user: { email, name: userName } });

        const data = {
            mrid:             'NA4JBW4FWCUQL',
            onIdentification: identityData => identityData
        };
        const result = tracker.getIdentity(data).then(accessToken => {
            expect(accessToken).to.be.an('object');
            expect(result).to.be.a('promise');
            done();
        });
    });
});
