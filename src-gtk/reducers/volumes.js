const initialState = {
  active: {
    0: 'd',
    1: 'd'
  },
  labels: ['c', 'd', 'e', 'net'],
  entities: {
    c: { icon_name: 'drive-harddisk', label: 'c' },
    d: { icon_name: 'drive-harddisk', label: 'd' },
    e: { icon_name: 'media-optical', label: 'e' },
    net: { icon_name: 'network-workgroup', label: 'net' }
  }
}

exports.default = () => initialState
