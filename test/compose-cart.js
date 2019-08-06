/* global it describe */
/* @flow */
import { expect } from 'chai';

// $FlowFixMe
import { removeFromCart } from '../src/lib/compose-cart';

const item1 = {
    id:     'XL novelty hat',
    imgUrl: 'https://www.paypalobjects.com/digitalassets/c/gifts/media/catalog/product/b/e/bestbuy.jpg',
    price:  100,
    title:  'Best Buy',
    url:    'http://localhost.paypal.com:8080/us/gifts/brands/best-buy'
};

const item2 = {
    id:     'XL novelty hat',
    imgUrl: 'https://www.paypalobjects.com/digitalassets/c/gifts/media/catalog/product/b/e/bestbuy.jpg',
    price:  100,
    title:  'Best Buy',
    url:    'http://localhost.paypal.com:8080/us/gifts/brands/best-buy'
};

const item3 = {
    id:     'XL novelty hat',
    imgUrl: 'https://www.paypalobjects.com/digitalassets/c/gifts/media/catalog/product/b/e/bestbuy.jpg',
    price:  100,
    title:  'Best Buy',
    url:    'http://localhost.paypal.com:8080/us/gifts/brands/best-buy'
};

const item4 = {
    id:     'rocket skates',
    imgUrl: 'https://www.paypalobjects.com/digitalassets/c/gifts/media/catalog/product/b/e/bestbuy.jpg',
    price:  100,
    title:  'Best Buy',
    url:    'http://localhost.paypal.com:8080/us/gifts/brands/best-buy'
};

const item5 = {
    id:     'rocket skates',
    imgUrl: 'https://www.paypalobjects.com/digitalassets/c/gifts/media/catalog/product/b/e/bestbuy.jpg',
    price:  100,
    title:  'Best Buy',
    url:    'http://localhost.paypal.com:8080/us/gifts/brands/best-buy'
};

const item6 = {
    id:     'a gigantic box of raisins',
    imgUrl: 'https://www.paypalobjects.com/digitalassets/c/gifts/media/catalog/product/b/e/bestbuy.jpg',
    price:  100,
    title:  'Best Buy',
    url:    'http://localhost.paypal.com:8080/us/gifts/brands/best-buy'
};

describe('compose cart', () => {
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

        it('throws when quantity is not a number', () => {
            const currentItems = [ item1, item2, item3, item4, item5, item6 ];
            const itemsToRemove = [ { id: item1.id, quantity: 'a lot' } ];

            try {
                removeFromCart(itemsToRemove, currentItems);
            } catch (err) {
                expect(err.message).to.equal('quantity must be a number');
            }
        });
    });
});
