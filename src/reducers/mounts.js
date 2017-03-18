const actions = require('../actions')
const assign = require('lodash/assign')

const initialState = {
  active: {
    0: '/',
    1: '/'
  },
  names: ['/'],
  entities: {
    '/': {
      name: '/',
      icon: 'computer',
      iconType: 'ICON_NAME',
      rootUri: 'file:///',
      attributes: {}
    }
  }
}

exports.default = (_state, action) => {
  const state = _state || initialState

  switch (action.type) {
    case actions.DRIVES:
      if (!action.result) {
        return state
      }

      let mounts = []

      mounts = mounts.concat(action.result.drives.reduce((prev, drive) => {
        return prev.concat(drive.volumes.map(volume => volume.mount || {
          uuid: volume.identifiers.uuid,
          name: volume.identifiers.label || volume.identifiers.uuid,
          icon: 'drive-harddisk',
          iconType: 'ICON_NAME',
          rootUri: null,
          attributes: {}
        }))
      }, []))

      mounts = mounts.concat(action.result.mounts)

      mounts = mounts.filter((x, i, xs) => {
        for (let j = 0; j < i; j++) {
          if (xs[j].name === x.name) {
            return false
          }
        }

        return true
      })

      return assign({}, state, {
        names: mounts.map(x => x.name).sort(),
        entities: mounts.reduce((prev, x) => {
          prev[x.name] = x
          return prev
        }, {})
      })

    default:
      return state
  }
}
