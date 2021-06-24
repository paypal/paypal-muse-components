/* @flow */
import type { Config } from '../types';


/**
 * Sets up a page context object that uses Config object to store variables within the page scope.
 * Currently, there is no constraint on the varables (name,value). the set of supported vairables will be described
 * in the SDK documentation. Primary reason, for not having any restriction is to build a generic interafce for vairables and
 * once we clear about the supported list of vairables, the constraint maybe added.
 *
 * @param config
 * @returns {{viewPage: (function(...[*]=))}}
 */
export function shoppingAttributes (config : Config) : Object {
  return {
    updateShoppingAttributes: (variables : Object) =>  {
      const priorAttributes = config.shoppingAttributes || {};
      config.shoppingAttributes = { ...priorAttributes, ...variables };
    }
  };
}
