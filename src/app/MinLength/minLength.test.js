/* global it */
const expect = require('expect')
const minLength = require('./minLength').default

it('shortens string', () => {
  const xs = ['foo', 'bar', 'baz', 'qux']
  expect(minLength(xs, 'foo')).toBe('f')
  expect(minLength(xs, 'bar')).toBe('bar')
  expect(minLength(xs, 'baz')).toBe('baz')
  expect(minLength(xs, 'qux')).toBe('q')
})
