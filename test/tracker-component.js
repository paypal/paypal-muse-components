/* globals describe before after afterEach it */
/* @flow */

import { expect } from 'chai';

import { Tracker } from '../src/tracker-component';

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
    before(() => {
        // $FlowFixMe
        document.body.appendChild = appendChild;
        // $FlowFixMe
        document.createElement = createElement;
    });

    after(() => {
        // $FlowFixMe
        document.body.appendChild = originalDocumentBodyAppendChild;
        // $FlowFixMe
        document.createElement = originalDocumentCreateElement;
    });

    afterEach(() => {
        appendChildCalls = 0;
        imgMock.src = '';
    });

    it('should be a function that returns a tracker', () => {
        const userID = '__test__userID';
        const userName = '__test__userName';
        const tracker = Tracker({ user: { id: userID, name: userName } });
        expect(tracker).to.have.property('view');
        expect(tracker).to.have.property('addToCart');
        expect(tracker).to.have.property('setCart');
        expect(tracker).to.have.property('removeFromCart');
        expect(tracker).to.have.property('purchase');
    });

    it('should send view events', () => {
        const userID = '__test__userID2';
        const userName = '__test__userName2';
        const tracker = Tracker({ user: { id: userID, name: userName } });
        expect(appendChildCalls).to.equal(0);
        tracker.view({
            pageUrl: 'https://example.com/test2'
        });
        expect(imgMock.src).to.equal(
            'https://www.paypal.com/targeting/track/view?data=eyJwYWdlVXJsIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS90ZXN0MiIsInVzZXIiOnsiaWQiOiJfX3Rlc3RfX3VzZXJJRDIiLCJuYW1lIjoiX190ZXN0X191c2VyTmFtZTIifSwidHJhY2tpbmdUeXBlIjoidmlldyIsImNsaWVudElkIjoiYWJjeHl6MTIzIiwibWVyY2hhbnRJZCI6Inh5eixoaWosbG1ubyJ9'
        );
        expect(JSON.stringify(extractDataParam(imgMock.src))).to.equal(
            JSON.stringify({
                pageUrl:      'https://example.com/test2',
                user:         { id: '__test__userID2', name: '__test__userName2' },
                trackingType: 'view',
                clientId:     'abcxyz123',
                merchantId:   'xyz,hij,lmno'
            })
        );
        expect(appendChildCalls).to.equal(1);
    });

    it('should send addToCart events', () => {
        const userID = '__test__userID3';
        const userName = '__test__userName3';
        const tracker = Tracker({ user: { id: userID, name: userName } });
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
            'https://www.paypal.com/targeting/track/cartEvent?data=eyJjYXJ0SWQiOiJfX3Rlc3RfX2NhcnRJZCIsIml0ZW1zIjpbeyJpZCI6Il9fdGVzdF9fcHJvZHVjdElkIiwidXJsIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS9fX3Rlc3RfX3Byb2R1Y3RJZCJ9XSwiZW1haWxDYW1wYWlnbklkIjoiX190ZXN0X19lbWFpbENhbXBhaWduSWQiLCJ0b3RhbCI6IjEyMzQ1LjY3IiwiY3VycmVuY3lDb2RlIjoiVVNEIiwiY2FydEV2ZW50VHlwZSI6ImFkZFRvQ2FydCIsInVzZXIiOnsiaWQiOiJfX3Rlc3RfX3VzZXJJRDMiLCJuYW1lIjoiX190ZXN0X191c2VyTmFtZTMifSwidHJhY2tpbmdUeXBlIjoiY2FydEV2ZW50IiwiY2xpZW50SWQiOiJhYmN4eXoxMjMiLCJtZXJjaGFudElkIjoieHl6LGhpaixsbW5vIn0%3D'
        );
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
                user:            { id: '__test__userID3', name: '__test__userName3' },
                trackingType:    'cartEvent',
                clientId:        'abcxyz123',
                merchantId:      'xyz,hij,lmno'
            })
        );
        expect(appendChildCalls).to.equal(1);
    });

    it('should send setCart events', () => {
        const userID = '__test__userID4';
        const userName = '__test__userName4';
        const tracker = Tracker({ user: { id: userID, name: userName } });
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
            'https://www.paypal.com/targeting/track/cartEvent?data=eyJjYXJ0SWQiOiJfX3Rlc3RfX2NhcnRJZCIsIml0ZW1zIjpbeyJpZCI6Il9fdGVzdF9fcHJvZHVjdElkIiwidXJsIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS9fX3Rlc3RfX3Byb2R1Y3RJZCJ9XSwiZW1haWxDYW1wYWlnbklkIjoiX190ZXN0X19lbWFpbENhbXBhaWduSWQiLCJ0b3RhbCI6IjEyMzQ1LjY3IiwiY3VycmVuY3lDb2RlIjoiVVNEIiwiY2FydEV2ZW50VHlwZSI6InNldENhcnQiLCJ1c2VyIjp7ImlkIjoiX190ZXN0X191c2VySUQ0IiwibmFtZSI6Il9fdGVzdF9fdXNlck5hbWU0In0sInRyYWNraW5nVHlwZSI6ImNhcnRFdmVudCIsImNsaWVudElkIjoiYWJjeHl6MTIzIiwibWVyY2hhbnRJZCI6Inh5eixoaWosbG1ubyJ9'
        );
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
                user:            { id: '__test__userID4', name: '__test__userName4' },
                trackingType:    'cartEvent',
                clientId:        'abcxyz123',
                merchantId:      'xyz,hij,lmno'
            })
        );
        expect(appendChildCalls).to.equal(1);
    });

    it('should send removeFromCart events', () => {
        const userID = '__test__userID5';
        const userName = '__test__userName5';
        const tracker = Tracker({ user: { id: userID, name: userName } });
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
            'https://www.paypal.com/targeting/track/cartEvent?data=eyJjYXJ0SWQiOiJfX3Rlc3RfX2NhcnRJZCIsIml0ZW1zIjpbeyJpZCI6Il9fdGVzdF9fcHJvZHVjdElkIiwidXJsIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS9fX3Rlc3RfX3Byb2R1Y3RJZCJ9XSwiY2FydEV2ZW50VHlwZSI6InJlbW92ZUZyb21DYXJ0IiwidXNlciI6eyJpZCI6Il9fdGVzdF9fdXNlcklENSIsIm5hbWUiOiJfX3Rlc3RfX3VzZXJOYW1lNSJ9LCJ0cmFja2luZ1R5cGUiOiJjYXJ0RXZlbnQiLCJjbGllbnRJZCI6ImFiY3h5ejEyMyIsIm1lcmNoYW50SWQiOiJ4eXosaGlqLGxtbm8ifQ%3D%3D'
        );
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
                user:          { id: '__test__userID5', name: '__test__userName5' },
                trackingType:  'cartEvent',
                clientId:      'abcxyz123',
                merchantId:    'xyz,hij,lmno'
            })
        );
        expect(appendChildCalls).to.equal(1);
    });

    it('should send purchase events', () => {
        const userID = '__test__userID6';
        const userName = '__test__userName6';
        const tracker = Tracker({ user: { id: userID, name: userName } });
        expect(appendChildCalls).to.equal(0);
        tracker.purchase({
            cartId: '__test__cartId'
        });
        expect(imgMock.src).to.equal(
            'https://www.paypal.com/targeting/track/purchase?data=eyJjYXJ0SWQiOiJfX3Rlc3RfX2NhcnRJZCIsInVzZXIiOnsiaWQiOiJfX3Rlc3RfX3VzZXJJRDYiLCJuYW1lIjoiX190ZXN0X191c2VyTmFtZTYifSwidHJhY2tpbmdUeXBlIjoicHVyY2hhc2UiLCJjbGllbnRJZCI6ImFiY3h5ejEyMyIsIm1lcmNoYW50SWQiOiJ4eXosaGlqLGxtbm8ifQ%3D%3D'
        );
        expect(JSON.stringify(extractDataParam(imgMock.src))).to.equal(
            JSON.stringify({
                cartId:       '__test__cartId',
                user:         { id: '__test__userID6', name: '__test__userName6' },
                trackingType: 'purchase',
                clientId:     'abcxyz123',
                merchantId:   'xyz,hij,lmno'
            })
        );
        expect(appendChildCalls).to.equal(1);
    });

    it('should call paramsToBeaconUrl to create the url if you pass in paramsToBeaconUrl function', () => {
        const userID = '__test__userID6';
        const userName = '__test__userName6';
        let calledArgs;
        const paramsToBeaconUrl = (...args) => {
            calledArgs = args;
            return 'https://example.com/picture';
        };
        const tracker = Tracker({
            user: { id: userID, name: userName },
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
                            id:   '__test__userID6',
                            name: '__test__userName6'
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
        const userID = '__test__userID9';
        const userName = '__test__userName9';
        const email = '__test__email9';
        const tracker = Tracker({ user: { id: userID } });
        tracker.setUser({ user: { id: userID, userName, email } });
        expect(appendChildCalls).to.equal(0);
        tracker.view({
            pageUrl: 'https://example.com/test2'
        });
        expect(imgMock.src).to.equal(
            'https://www.paypal.com/targeting/track/view?data=eyJwYWdlVXJsIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS90ZXN0MiIsInVzZXIiOnsiaWQiOiJfX3Rlc3RfX3VzZXJJRDkiLCJlbWFpbCI6Il9fdGVzdF9fZW1haWw5In0sInRyYWNraW5nVHlwZSI6InZpZXciLCJjbGllbnRJZCI6ImFiY3h5ejEyMyIsIm1lcmNoYW50SWQiOiJ4eXosaGlqLGxtbm8ifQ%3D%3D'
        );
        expect(JSON.stringify(extractDataParam(imgMock.src))).to.equal(
            JSON.stringify({
                pageUrl:      'https://example.com/test2',
                user:         { id: '__test__userID9', email: '__test__email9' },
                trackingType: 'view',
                clientId:     'abcxyz123',
                merchantId:   'xyz,hij,lmno'
            })
        );
        expect(appendChildCalls).to.equal(1);
    });
});
