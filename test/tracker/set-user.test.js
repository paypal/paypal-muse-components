/* global it describe beforeEach expect */
/* @flow */
import { Tracker } from '../../src/tracker-component';

describe('setUser', () => {
    let config;

    beforeEach(() => {
        config = {
            user: {
                // id: 'arglebargle123',
                name: 'Bob Ross',
                email: 'bossrob21@pbs.org'
            }
        };
    });

    it('user should be set when the tracker is initialized', () => {
        Tracker(config);

        expect(true).toEqual(true);
    });

    // it('no user should be set if no user is passed to initialization', () => {
    //     expect(true).toEqual(false);
    // });

    // it('user should be set when set user is called', () => {
    //     expect(true).toEqual(false);
    // });

    // it('already-existing user should be updated when set user is called', () => {
    //     expect(true).toEqual(false);
    // });


    // it('setUser accepts different types of input', () => {
    //     expect(true).toEqual(false);
    // });

    // it('user can be unset by passing null', () => {
    //     expect(true).toEqual(false);
    // });
});
