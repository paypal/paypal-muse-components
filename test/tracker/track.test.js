/* @flow */
/* global it describe beforeEach afterAll expect */
import { track } from '../../src/lib/track';
import constants from '../../src/lib/constants';

const { imgElementId, storage } = constants;

describe('track', () => {
    let mockConfig;
    let mockTrackingData;

    beforeEach(() => {
        mockConfig = {
            user: {
                name: 'Phil Collins',
                id: 'a random user id',
                email: 'phil@collins.com'
            },
            propertyId: 'mahproperty',
            currencyCode: 'USD'
        };

        mockTrackingData = {
            cartId: 'acartidofsomekind',
            items: [ {
                id: 'abc-123',
                title: 'holiday-themed throwing axe set',
                url: 'www.heavymetalchristmas.com',
                imgUrl: 'www.heavymetalchristmas.com/images/family-gathering.jpg',
                keywords: [ 'christmas', 'throwing axes', 'metal', 'insurance liability' ],
                price: '19.95',
                quantity: 1
            } ],
            total: '19.95',
            currencyCode: 'USD'
        };
    });

    afterEach(() => {
        const img = document.getElementById(imgElementId);

        if (img) {
            document.body.removeChild(img);
        }
    });

    afterAll(() => {
        window.localStorage.removeItem(storage.paypalCrUser);
    });

    it('creates a new image element if one does not exist', () => {
        let img = document.getElementById(imgElementId);

        expect(img).toBe(null);
        track(mockConfig, 'cartEvent', mockTrackingData);
        img = document.getElementById(imgElementId);
        expect(img).toBeTruthy();
        expect(typeof img.src).toBe('string');
        expect(img.src.length).toBeGreaterThan(0);
    });

    it('updates an image element if one already exists', () => {
        let img;

        track(mockConfig, 'cartEvent', mockTrackingData);
        img = document.getElementById(imgElementId);
        const src1 = img.src;

        mockTrackingData.total = '1000';
        mockTrackingData.currencyCode = 'DARSEK';

        track(mockConfig, 'cartEvent', mockTrackingData);
        img = document.getElementById(imgElementId);
        const src2 = img.src;

        const imageElements = document.body.getElementsByTagName('img');

        expect(typeof src1).toBe('string');
        expect(typeof src2).toBe('string');
        expect(src1).not.toBe(src2);
        expect(imageElements.length).toBe(1);
    });

});
