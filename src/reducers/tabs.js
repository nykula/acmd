const sampleTabs = {
  active: 34,
  ids: [12, 34],
  entities: {
    12: {
      id: 12,
      text: '1977 animals'
    },
    34: {
      id: 34,
      icon: 'folder-music',
      text: 'Music'
    }
  }
}

const initialState = {
  0: sampleTabs,
  1: sampleTabs
}

exports.default = () => initialState
