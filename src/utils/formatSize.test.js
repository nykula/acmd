/* global expect, it */
const formatSize = require('./formatSize').default

it('formats size as 1 M, 23 k, 456 B', () => {
  const pairs = [
    [1000000000, '1 G'],
    [1073741824, '1 G'],
    [1500000000, '2 G'],
    [1999999999, '2 G'],
    [1000000, '1 M'],
    [1048576, '1 M'],
    [1500000, '2 M'],
    [1999999, '2 M'],
    [23000, '23 k'],
    [23123, '23 k'],
    [23552, '24 k'],
    [23999, '24 k'],
    [456, '456 B']
  ]

  pairs.forEach(pair => {
    expect(pair[0] + ' -> ' + formatSize(pair[0])).toBe(pair[0] + ' -> ' + pair[1])
  })
})