'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});


/**
 * This function says hello.
 * @param name Some name to say hello for.
 * @returns The hello.
 */
const sayHello = (name = 'Haz') => `Hello, ${name}!`;

exports.default = sayHello;