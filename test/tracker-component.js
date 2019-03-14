/* globals describe before after afterEach it */
/* @flow */

import { expect } from 'chai';

import { Tracker } from '../src/tracker-component';

describe('paypal.Tracker', () => {
    let appendChildCalls = 0;
    const appendChild = () => {
        appendChildCalls += 1;
    };

    const imgMock = { src: '', style: {}, addEventListener: () => { /* empty */ } };

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
        expect(tracker).to.not.have.property('purchases');
    });

    it('should send view events', () => {
        const userID = '__test__userID2';
        const userName = '__test__userName2';
        const tracker = Tracker({ user: { id: userID, name: userName } });
        expect(appendChildCalls).to.equal(0);
        tracker.view({
            pageUrl: 'https://example.com/test2'
        });
        expect(imgMock.src).to.equal('https://www.paypal.com/targeting/track/view?data=eyJwYWdlVXJsIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS90ZXN0MiIsInVzZXIiOnsiaWQiOiJfX3Rlc3RfX3VzZXJJRDIiLCJuYW1lIjoiX190ZXN0X191c2VyTmFtZTIifSwidHJhY2tpbmdUeXBlIjoidmlldyIsImNsaWVudElkIjoiYWJjeHl6MTIzIiwibWVyY2hhbnRJZCI6Inh5eixoaWosbG1ubyJ9');
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
            price:           12345.67,
            currencyCode:    'USD',
            keywords:        [ '__test__' ]
        });
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
            price:           12345.67,
            currencyCode:    'USD',
            keywords:        [ '__test__' ]
        });
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
});
