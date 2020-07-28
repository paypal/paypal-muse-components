/* global expect */
/* @flow */
import {
  validateUser
} from '../src/lib/validation';

describe('input validation', () => {

  describe('validateUser', () => {
    let validInput1;
    let validInput2;

    beforeEach(() => {
      validInput1 = {
        id: 'flimflam',
        email: 'baz@bar.com',
        name: 'Richard Festerboothe III'
      };
      validInput2 = {
        user: {
          id: 'arglebargle',
          email: 'foo@bar.com',
          name: 'Samantha Tarbox'
        }
      };
    });

    it('throws when input is invalid', () => {
      const invalidInput = [ 'thataintright' ];

      try {
        validateUser(invalidInput);
      } catch (err) {
        expect(err.message).toBe('Input error: expected array to be object');
      }
    });

    it('throws when user input is invalid', () => {
      const invalidInput = {
        user: 'this should be an object'
      };

      try {
        validateUser(invalidInput);
      } catch (err) {
        expect(err.message).toBe('Input error for user: expected string to be object');
      }
    });

    it('works normally when input is valid', () => {
      validateUser(validInput1);
      validateUser(validInput2);
    });
  });
});
