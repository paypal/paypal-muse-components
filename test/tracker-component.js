/* globals describe before after afterEach it */
/* @flow */

import { expect } from 'chai';

import { Tracker } from '../src/tracker-component';
// eslint-disable-next-line import/no-namespace
import * as generateIdModule from '../src/generate-id';

const decode = (encodedDataParam : string) : string => {
    return JSON.parse(atob(decodeURIComponent(encodedDataParam)));
};

const extractDataParam = (url : string) : string => {
    return decode(
        (url.match(/\?data=(.+)$/) || [ '', encodeURIComponent(btoa(JSON.stringify({}))) ])[1]
    );
};

describe('paypal.Tracker', () => {
    let appendChildCalls = 0;
    const appendChild = () => {
        appendChildCalls += 1;
    };

    const imgMock = {
        src:              '',
        style:            {},
        addEventListener: () => {
            /* empty */
        }
    };

    const createElement = (elementType : string) => {
        expect(elementType).to.equal('img');
        return imgMock;
    };

    // $FlowFixMe
    const originalDocumentBodyAppendChild = document.body.appendChild;
    // $FlowFixMe
    const originalDocumentCreateElement = document.createElement;
    const originalGenerateId = generateIdModule.generateId;
    before(() => {
        // $FlowFixMe
        document.body.appendChild = appendChild;
        // $FlowFixMe
        document.createElement = createElement;
        // $FlowFixMe
        generateIdModule.generateId = () => 'abc123'; // eslint-disable-line import/namespace
    });

    after(() => {
        // $FlowFixMe
        document.body.appendChild = originalDocumentBodyAppendChild;
        // $FlowFixMe
        document.createElement = originalDocumentCreateElement;
        // $FlowFixMe
        generateIdModule.generateId = originalGenerateId; // eslint-disable-line import/namespace
    });

    afterEach(() => {
        appendChildCalls = 0;
        imgMock.src = '';
    });

    it('should be a function that returns a tracker', () => {
        const tracker = Tracker();
        expect(tracker).to.have.property('view');
        expect(tracker).to.have.property('addToCart');
        expect(tracker).to.have.property('setCart');
        expect(tracker).to.have.property('removeFromCart');
        expect(tracker).to.have.property('purchase');
    });

    it('should send view events', () => {
        const email = '__test__email2@gmail.com';
        const userName = '__test__userName2';
        const tracker = Tracker({ user: { email, name: userName } });
        expect(appendChildCalls).to.equal(0);
        tracker.view({
            page:  '/test2/apples',
            title: 'apples'
        });
        expect(imgMock.src).to.equal(
            'https://www.paypal.com/targeting/track/view?data=eyJwYWdlIjoiL3Rlc3QyL2FwcGxlcyIsInRpdGxlIjoiYXBwbGVzIiwidXNlciI6eyJlbWFpbCI6Il9fdGVzdF9fZW1haWwyQGdtYWlsLmNvbSIsIm5hbWUiOiJfX3Rlc3RfX3VzZXJOYW1lMiIsImlkIjoiYWJjMTIzIn0sInRyYWNraW5nVHlwZSI6InZpZXciLCJjbGllbnRJZCI6ImFiY3h5ejEyMyIsIm1lcmNoYW50SWQiOiJ4eXosaGlqLGxtbm8ifQ%3D%3D'
        );
        expect(JSON.stringify(extractDataParam(imgMock.src))).to.equal(
            JSON.stringify({
                page:  '/test2/apples',
                title: 'apples',
                user:  {
                    email: '__test__email2@gmail.com',
                    name:  '__test__userName2',
                    id:    'abc123'
                },
                trackingType: 'view',
                clientId:     'abcxyz123',
                merchantId:   'xyz,hij,lmno'
            })
        );
        expect(appendChildCalls).to.equal(1);
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
        expect(imgMock.src).to.equal(
            'https://www.paypal.com/targeting/track/cartEvent?data=eyJjYXJ0SWQiOiJfX3Rlc3RfX2NhcnRJZCIsIml0ZW1zIjpbeyJpZCI6Il9fdGVzdF9fcHJvZHVjdElkIiwidXJsIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS9fX3Rlc3RfX3Byb2R1Y3RJZCJ9XSwiZW1haWxDYW1wYWlnbklkIjoiX190ZXN0X19lbWFpbENhbXBhaWduSWQiLCJ0b3RhbCI6IjEyMzQ1LjY3IiwiY3VycmVuY3lDb2RlIjoiVVNEIiwiY2FydEV2ZW50VHlwZSI6ImFkZFRvQ2FydCIsInVzZXIiOnsiZW1haWwiOiJfX3Rlc3RfX2VtYWlsM0BnbWFpbC5jb20iLCJuYW1lIjoiX190ZXN0X191c2VyTmFtZTMiLCJpZCI6ImFiYzEyMyJ9LCJ0cmFja2luZ1R5cGUiOiJjYXJ0RXZlbnQiLCJjbGllbnRJZCI6ImFiY3h5ejEyMyIsIm1lcmNoYW50SWQiOiJ4eXosaGlqLGxtbm8ifQ%3D%3D'
        );
        expect(JSON.stringify(extractDataParam(imgMock.src))).to.equal(
            JSON.stringify({
                cartId:          '__test__cartId',
                items:           [ { id: '__test__productId', url: 'https://example.com/__test__productId' } ],
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
                merchantId:   'xyz,hij,lmno'
            })
        );
        expect(appendChildCalls).to.equal(1);
    });

    it('should send setCart events', () => {
        const email = '__test__email4@gmail.com';
        const userName = '__test__userName4';
        const tracker = Tracker({ user: { email, name: userName } });
        expect(appendChildCalls).to.equal(0);
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
        expect(imgMock.src).to.equal(
            'https://www.paypal.com/targeting/track/cartEvent?data=eyJjYXJ0SWQiOiJfX3Rlc3RfX2NhcnRJZCIsIml0ZW1zIjpbeyJpZCI6Il9fdGVzdF9fcHJvZHVjdElkIiwidXJsIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS9fX3Rlc3RfX3Byb2R1Y3RJZCJ9XSwiZW1haWxDYW1wYWlnbklkIjoiX190ZXN0X19lbWFpbENhbXBhaWduSWQiLCJ0b3RhbCI6IjEyMzQ1LjY3IiwiY3VycmVuY3lDb2RlIjoiVVNEIiwiY2FydEV2ZW50VHlwZSI6InNldENhcnQiLCJ1c2VyIjp7ImVtYWlsIjoiX190ZXN0X19lbWFpbDRAZ21haWwuY29tIiwibmFtZSI6Il9fdGVzdF9fdXNlck5hbWU0IiwiaWQiOiJhYmMxMjMifSwidHJhY2tpbmdUeXBlIjoiY2FydEV2ZW50IiwiY2xpZW50SWQiOiJhYmN4eXoxMjMiLCJtZXJjaGFudElkIjoieHl6LGhpaixsbW5vIn0%3D'
        );
        expect(JSON.stringify(extractDataParam(imgMock.src))).to.equal(
            JSON.stringify({
                cartId:          '__test__cartId',
                items:           [ { id: '__test__productId', url: 'https://example.com/__test__productId' } ],
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
                merchantId:   'xyz,hij,lmno'
            })
        );
        expect(appendChildCalls).to.equal(1);
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
        expect(imgMock.src).to.equal(
            'https://www.paypal.com/targeting/track/cartEvent?data=eyJjYXJ0SWQiOiJfX3Rlc3RfX2NhcnRJZCIsIml0ZW1zIjpbeyJpZCI6Il9fdGVzdF9fcHJvZHVjdElkIiwidXJsIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS9fX3Rlc3RfX3Byb2R1Y3RJZCJ9XSwiY2FydEV2ZW50VHlwZSI6InJlbW92ZUZyb21DYXJ0IiwidXNlciI6eyJlbWFpbCI6Il9fdGVzdF9fZW1haWw1QGdtYWlsLmNvbSIsIm5hbWUiOiJfX3Rlc3RfX3VzZXJOYW1lNSIsImlkIjoiYWJjMTIzIn0sInRyYWNraW5nVHlwZSI6ImNhcnRFdmVudCIsImNsaWVudElkIjoiYWJjeHl6MTIzIiwibWVyY2hhbnRJZCI6Inh5eixoaWosbG1ubyJ9'
        );
        expect(JSON.stringify(extractDataParam(imgMock.src))).to.equal(
            JSON.stringify({
                cartId:        '__test__cartId',
                items:         [ { id: '__test__productId', url: 'https://example.com/__test__productId' } ],
                cartEventType: 'removeFromCart',
                user:          {
                    email: '__test__email5@gmail.com',
                    name:  '__test__userName5',
                    id:    'abc123'
                },
                trackingType: 'cartEvent',
                clientId:     'abcxyz123',
                merchantId:   'xyz,hij,lmno'
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
        expect(imgMock.src).to.equal(
            'https://www.paypal.com/targeting/track/purchase?data=eyJjYXJ0SWQiOiJfX3Rlc3RfX2NhcnRJZCIsInVzZXIiOnsiZW1haWwiOiJfX3Rlc3RfX2VtYWlsNkBnbWFpbC5jb20iLCJuYW1lIjoiX190ZXN0X191c2VyTmFtZTYiLCJpZCI6ImFiYzEyMyJ9LCJ0cmFja2luZ1R5cGUiOiJwdXJjaGFzZSIsImNsaWVudElkIjoiYWJjeHl6MTIzIiwibWVyY2hhbnRJZCI6Inh5eixoaWosbG1ubyJ9'
        );
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
                merchantId:   'xyz,hij,lmno'
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
                        merchantId:   'xyz,hij,lmno'
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
                oldUserId:    'abc123',
                user:         { email: '__test__email9', name: '__test__userName9', id: 'abc123' },
                trackingType: 'setUser',
                clientId:     'abcxyz123',
                merchantId:   'xyz,hij,lmno'
            })
        );
        tracker.view({
            page: '/test2'
        });
        expect(imgMock.src).to.equal(
            'https://www.paypal.com/targeting/track/view?data=eyJwYWdlIjoiL3Rlc3QyIiwidXNlciI6eyJlbWFpbCI6Il9fdGVzdF9fZW1haWw5IiwibmFtZSI6Il9fdGVzdF9fdXNlck5hbWU5IiwiaWQiOiJhYmMxMjMifSwidHJhY2tpbmdUeXBlIjoidmlldyIsImNsaWVudElkIjoiYWJjeHl6MTIzIiwibWVyY2hhbnRJZCI6Inh5eixoaWosbG1ubyJ9'
        );
        expect(JSON.stringify(extractDataParam(imgMock.src))).to.equal(
            JSON.stringify({
                page:         '/test2',
                user:         { email: '__test__email9', name: '__test__userName9', id: 'abc123' },
                trackingType: 'view',
                clientId:     'abcxyz123',
                merchantId:   'xyz,hij,lmno'
            })
        );
        expect(appendChildCalls).to.equal(2);
    });

    it('should allow you to instantiate for anonymous users', () => {
        const tracker = Tracker();
        tracker.view({ page: '/hello/page' });
        const dataParamObject = extractDataParam(imgMock.src);
        // $FlowFixMe
        expect(dataParamObject.page).to.equal('/hello/page');
        // $FlowFixMe
        expect(dataParamObject.trackingType).to.equal('view');
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
                oldUserId:    'abc123',
                user:         { email: '__test__email@gmail.com', name: '__test__name', id: 'abc123' },
                trackingType: 'setUser',
                clientId:     'abcxyz123',
                merchantId:   'xyz,hij,lmno'
            })
        );
    });

    it('should send last user set with setUser', () => {
        const tracker = Tracker();
        tracker.setUser({ user: { email: '__test__email1' } });
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
                cartId:          '__test__cartId',
                items:           [ { id: '__test__productId', url: 'https://example.com/__test__productId' } ],
                emailCampaignId: '__test__emailCampaignId',
                total:           '12345.67',
                currencyCode:    'USD',
                cartEventType:   'addToCart',
                user:            { email: '__test__email2', id: 'abc123' },
                trackingType:    'cartEvent',
                clientId:        'abcxyz123',
                merchantId:      'xyz,hij,lmno'
            })
        );
    });

    it('should use localStorage value if it exists', () => {
        localStorage.setItem('user-id', 'generated-user-id-123');
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
                cartId:          '__test__cartId',
                items:           [ { id: '__test__productId', url: 'https://example.com/__test__productId' } ],
                emailCampaignId: '__test__emailCampaignId',
                total:           '12345.67',
                currencyCode:    'USD',
                cartEventType:   'addToCart',
                user:            { id: 'generated-user-id-123' },
                trackingType:    'cartEvent',
                clientId:        'abcxyz123',
                merchantId:      'xyz,hij,lmno'
            })
        );
    });

    it('should use document.cookie value if it exists, not localStorage value', () => {
        localStorage.setItem('user-id', 'generated-user-id-123');
        document.cookie = 'cookie-id';
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
                cartId:          '__test__cartId',
                items:           [ { id: '__test__productId', url: 'https://example.com/__test__productId' } ],
                emailCampaignId: '__test__emailCampaignId',
                total:           '12345.67',
                currencyCode:    'USD',
                cartEventType:   'addToCart',
                user:            { id: 'cookie-id' },
                trackingType:    'cartEvent',
                clientId:        'abcxyz123',
                merchantId:      'xyz,hij,lmno'
            })
        );
        document.cookie = '';
    });
});
