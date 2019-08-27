/* global it describe beforeAll expect */
/* @flow */

// $FlowFixMe
import { removeFromCart, addToCart } from '../src/lib/compose-cart';
// $FlowFixMe
import { Tracker } from '../src/tracker-component';

const localStorageKey = 'paypal-cr-cart';
const emailCampaignId = 'crazy_leroy@geocities.com';
const cartId = 'a-unique-cart-id';

const item1 = {
    id: 'XL novelty hat',
    imgUrl: 'https://www.paypalobjects.com/digitalassets/c/gifts/media/catalog/product/b/e/bestbuy.jpg',
    price: '100.00',
    title: 'Best Buy',
    url: 'http://localhost.paypal.com:8080/us/gifts/brands/best-buy'
};

const item2 = {
    id: 'XL novelty hat',
    imgUrl: 'https://www.paypalobjects.com/digitalassets/c/gifts/media/catalog/product/b/e/bestbuy.jpg',
    price: '100.00',
    title: 'Best Buy',
    url: 'http://localhost.paypal.com:8080/us/gifts/brands/best-buy'
};

const item3 = {
    id: 'XL novelty hat',
    imgUrl: 'https://www.paypalobjects.com/digitalassets/c/gifts/media/catalog/product/b/e/bestbuy.jpg',
    price: '100.00',
    title: 'Best Buy',
    url: 'http://localhost.paypal.com:8080/us/gifts/brands/best-buy'
};

const item4 = {
    id: 'rocket skates',
    imgUrl: 'https://www.paypalobjects.com/digitalassets/c/gifts/media/catalog/product/b/e/bestbuy.jpg',
    price: '100.00',
    title: 'Best Buy',
    url: 'http://localhost.paypal.com:8080/us/gifts/brands/best-buy'
};

const item5 = {
    id: 'rocket skates',
    imgUrl: 'https://www.paypalobjects.com/digitalassets/c/gifts/media/catalog/product/b/e/bestbuy.jpg',
    price: '100.00',
    title: 'Best Buy',
    url: 'http://localhost.paypal.com:8080/us/gifts/brands/best-buy'
};

const item6 = {
    id: 'a gigantic box of raisins',
    imgUrl: 'https://www.paypalobjects.com/digitalassets/c/gifts/media/catalog/product/b/e/bestbuy.jpg',
    price: '100.00',
    title: 'Best Buy',
    url: 'http://localhost.paypal.com:8080/us/gifts/brands/best-buy'
};

describe('compose cart', () => {
    describe('composeCart', () => {
        const cart = {
            cartId,
            items: [],
            emailCampaignId: 'crazy_leroy@geocities.com',
            total: '0.00',
            currencyCode: 'USD'
        };

        beforeAll(() => {
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
            expect(result.items).toEqual([ item1 ]);

            cart.items = [ item4 ];

            tracker.addToCart(cart);
    
            result = window.localStorage.getItem(localStorageKey);
            result = JSON.parse(result);

            expect(result.items).toEqual([ item1, item4 ]);
            expect(result.cartId).toEqual(cartId);
            expect(result.emailCampaignId).toEqual(emailCampaignId);
            expect(result.total).toEqual('0.00');
            expect(result.currencyCode).toEqual('USD');
        });

        it('sets items correctly', () => {
            const tracker = Tracker();
            cart.items = [ item1, item2 ];

            tracker.addToCart(cart);

            cart.items = [ item5, item6 ];

            tracker.setCart(cart);
    
            let result = window.localStorage.getItem(localStorageKey);
            result = JSON.parse(result);

            expect(result.items).toEqual([ item5, item6 ]);

            cart.items = [];
            tracker.setCart(cart);
            result = window.localStorage.getItem(localStorageKey);
            result = JSON.parse(result);
            expect(result.items).toEqual([]);
            expect(result.cartId).toEqual(cartId);
            expect(result.emailCampaignId).toEqual(emailCampaignId);
            expect(result.total).toEqual('0.00');
            expect(result.currencyCode).toEqual('USD');
        });

        it('removes items correctly', () => {
            const tracker = Tracker();
            const itemsToRemove = [ { id: 'XL novelty hat', quantity: 2 }, { id: 'rocket skates', quantity: 1 } ];
            cart.items = [ item1, item2, item3, item4, item5 ];

            tracker.setCart(cart);
            tracker.removeFromCart({ items: itemsToRemove });

            let result = window.localStorage.getItem(localStorageKey);
            result = JSON.parse(result);

            expect(result.items).toEqual([ item3, item5 ]);
            expect(result.cartId).toEqual(cartId);
            expect(result.emailCampaignId).toEqual(emailCampaignId);
            expect(result.total).toEqual('0.00');
            expect(result.currencyCode).toEqual('USD');
        });
    });

    describe('addToCart', () => {
        it('adds one item when no quantity is specified', () => {
            const currentItems = [];
            const expected = [ item1 ];
            const itemsToAdd = [ item1 ];

            const result = addToCart(itemsToAdd, currentItems);
            expect(result).toEqual(expected);
        });

        it('throws when quantity is infinity, because that\'s ridiculous', (done) => {
            const currentItems = [];
            const expected = `'Infinity' is not an accepted quantity for item: ${ item1.id }`;
            const itemsToAdd = [ { ...item1, quantity: Infinity } ];

            try {
                addToCart(itemsToAdd, currentItems);
            } catch (err) {
                expect(err.message).toEqual(expected);
                done();
            }
        });

        it('adds the correct number of items', () => {
            const currentItems = [ item6 ];
            const expected = [ item6, item1, item1, item1, item4, item5, item5 ];
            const itemsToAdd = [ item1, { ...item1, quantity: 2 }, item4, { ...item5, quantity: 2 } ];

            const result = addToCart(itemsToAdd, currentItems);
            expect(result).toEqual(expected);
        });
    });

    describe('removeFromCart', () => {
        it('removes all instances of an item when infinity is passed', () => {
            const currentItems = [ item1, item2, item3, item4, item5, item6 ];
            const expected = [ item4, item5, item6 ];
            const itemsToRemove = [ { id: item1.id, quantity: Infinity } ];

            const result = removeFromCart(itemsToRemove, currentItems);
            expect(result).toEqual(expected);
        });

        it('removes one item when no quantity is specified', () => {
            const currentItems = [ item1, item2, item3, item4, item5, item6 ];
            const expected = [ item2, item3, item4, item5, item6 ];
            const itemsToRemove = [ { id: item1.id } ];

            const result = removeFromCart(itemsToRemove, currentItems);
            expect(result).toEqual(expected);
        });

        it('removes the specified number of items', () => {
            const currentItems = [ item1, item2, item3, item4, item5, item6 ];
            const expected = [ item3, item6 ];
            const itemsToRemove = [ { id: item1.id, quantity: 1 }, { id: item1.id }, { id: item4.id, quantity: 2 } ];

            const result = removeFromCart(itemsToRemove, currentItems);

            expect(result).toEqual(expected);
        });

        it('accepts quantity in excess of what is present in the cart', () => {
            const currentItems = [ item1, item2, item3, item4, item5, item6 ];
            const expected = [ item1, item2, item3, item4, item5 ];
            const itemsToRemove = [ { id: item6.id, quantity: 10 } ];

            const result = removeFromCart(itemsToRemove, currentItems);

            expect(result).toEqual(expected);
        });
    });
});
