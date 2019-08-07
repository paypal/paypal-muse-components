/* global it describe */
/* @flow */
import { expect } from 'chai';

// $FlowFixMe
import { removeFromCart } from '../src/lib/compose-cart';
// $FlowFixMe
import { Tracker } from '../src/tracker-component';

const localStorageKey = 'paypal-cr-cart';
const emailCampaignId = 'crazy_leroy@geocities.com';
const cartId = 'a-unique-cart-id';

const item1 = {
    id:     'XL novelty hat',
    imgUrl: 'https://www.paypalobjects.com/digitalassets/c/gifts/media/catalog/product/b/e/bestbuy.jpg',
    price:  '100.00',
    title:  'Best Buy',
    url:    'http://localhost.paypal.com:8080/us/gifts/brands/best-buy'
};

const item2 = {
    id:     'XL novelty hat',
    imgUrl: 'https://www.paypalobjects.com/digitalassets/c/gifts/media/catalog/product/b/e/bestbuy.jpg',
    price:  '100.00',
    title:  'Best Buy',
    url:    'http://localhost.paypal.com:8080/us/gifts/brands/best-buy'
};

const item3 = {
    id:     'XL novelty hat',
    imgUrl: 'https://www.paypalobjects.com/digitalassets/c/gifts/media/catalog/product/b/e/bestbuy.jpg',
    price:  '100.00',
    title:  'Best Buy',
    url:    'http://localhost.paypal.com:8080/us/gifts/brands/best-buy'
};

const item4 = {
    id:     'rocket skates',
    imgUrl: 'https://www.paypalobjects.com/digitalassets/c/gifts/media/catalog/product/b/e/bestbuy.jpg',
    price:  '100.00',
    title:  'Best Buy',
    url:    'http://localhost.paypal.com:8080/us/gifts/brands/best-buy'
};

const item5 = {
    id:     'rocket skates',
    imgUrl: 'https://www.paypalobjects.com/digitalassets/c/gifts/media/catalog/product/b/e/bestbuy.jpg',
    price:  '100.00',
    title:  'Best Buy',
    url:    'http://localhost.paypal.com:8080/us/gifts/brands/best-buy'
};

const item6 = {
    id:     'a gigantic box of raisins',
    imgUrl: 'https://www.paypalobjects.com/digitalassets/c/gifts/media/catalog/product/b/e/bestbuy.jpg',
    price:  '100.00',
    title:  'Best Buy',
    url:    'http://localhost.paypal.com:8080/us/gifts/brands/best-buy'
};

describe('compose cart', () => {
    describe('composeCart', () => {
        const cart = {
            cartId,
            items:           [],
            emailCampaignId: 'crazy_leroy@geocities.com',
            total:           '0.00',
            currencyCode:    'USD'
        };

        before(() => {
            window.localStorage.removeItem(localStorageKey);
        });

        afterEach(() => {
            window.localStorage.removeItem(localStorageKey);
            cart.items = [];
        });

        it('adds items correctly', () => {
            const tracker = Tracker();
            cart.items = [ item1 ];

            tracker.addToCart(cart);
            let result = window.localStorage.getItem(localStorageKey);
            result = JSON.parse(result);
            expect(result.items).to.deep.equal([ item1 ]);

            cart.items = [ item4 ];

            tracker.addToCart(cart);
    
            result = window.localStorage.getItem(localStorageKey);
            result = JSON.parse(result);

            expect(result.items).to.deep.equal([ item1, item4 ]);
            expect(result.cartId).to.equal(cartId);
            expect(result.emailCampaignId).to.equal(emailCampaignId);
            expect(result.total).to.equal('0.00');
            expect(result.currencyCode).to.equal('USD');
        });

        it('sets items correctly', () => {
            const tracker = Tracker();
            cart.items = [ item1, item2 ];

            tracker.addToCart(cart);

            cart.items = [ item5, item6 ];

            tracker.setCart(cart);
    
            let result = window.localStorage.getItem(localStorageKey);
            result = JSON.parse(result);

            expect(result.items).to.deep.equal([ item5, item6 ]);

            cart.items = [];
            tracker.setCart(cart);
            result = window.localStorage.getItem(localStorageKey);
            result = JSON.parse(result);
            expect(result.items).to.deep.equal([]);
            expect(result.cartId).to.equal(cartId);
            expect(result.emailCampaignId).to.equal(emailCampaignId);
            expect(result.total).to.equal('0.00');
            expect(result.currencyCode).to.equal('USD');
        });

        it('removes items correctly', () => {
            const tracker = Tracker();
            const itemsToRemove = [ { id: 'XL novelty hat', quantity: 2 }, { id: 'rocket skates', quantity: 1 } ];
            cart.items = [ item1, item2, item3, item4, item5 ];

            tracker.setCart(cart);
            tracker.removeFromCart({ items: itemsToRemove });

            let result = window.localStorage.getItem(localStorageKey);
            result = JSON.parse(result);

            expect(result.items).to.deep.equal([ item3, item5 ]);
            expect(result.cartId).to.equal(cartId);
            expect(result.emailCampaignId).to.equal(emailCampaignId);
            expect(result.total).to.equal('0.00');
            expect(result.currencyCode).to.equal('USD');
        });
    });

    describe('removeFromCart', () => {
        it('removes all instances of an item when no quantity is specified', () => {
            const currentItems = [ item1, item2, item3, item4, item5, item6 ];
            const expected = [ item4, item5, item6 ];
            const itemsToRemove = [ { id: item1.id } ];

            const result = removeFromCart(itemsToRemove, currentItems);

            expect(result).to.deep.equal(expected);
        });

        it('removes the specified number of items', () => {
            const currentItems = [ item1, item2, item3, item4, item5, item6 ];
            const expected = [ item3, item5, item6 ];
            const itemsToRemove = [ { id: item1.id, quantity: 2 }, { id: item4.id, quantity: 1 } ];

            const result = removeFromCart(itemsToRemove, currentItems);

            expect(result).to.deep.equal(expected);
        });

        it('accepts quantity in excess of what is present in the cart', () => {
            const currentItems = [ item1, item2, item3, item4, item5, item6 ];
            const expected = [ item1, item2, item3, item4, item5 ];
            const itemsToRemove = [ { id: item6.id, quantity: 10 } ];

            const result = removeFromCart(itemsToRemove, currentItems);

            expect(result).to.deep.equal(expected);
        });
    });
});
