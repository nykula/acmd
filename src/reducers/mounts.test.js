/* global expect, it */
const actions = require('../actions')
const reducer = require('./mounts').default

it('saves mounts when ready', () => {
  let action = actions.drives()
  let state = reducer(undefined, action)

  action = actions.drivesReady({
    requestId: 1,
    result: {
      drives: [
        {
          volumes: [
            {
              mount: null,
              identifiers: {
                uuid: 'abc'
              }
            },
            {
              mount: {
                name: 'System',
                icon: 'drive-harddisk',
                iconType: 'ICON_NAME',
                rootUri: 'file:///media/System',
                attributes: {}
              }
            }
          ]
        }
      ],
      mounts: [
        {
          name: '/',
          icon: 'computer',
          iconType: 'ICON_NAME',
          rootUri: 'file:///',
          attributes: {}
        },
        {
          name: 'abc',
          icon: 'drive-harddisk',
          iconType: 'ICON_NAME',
          rootUri: null,
          attributes: {}
        },
        {
          name: 'System',
          icon: 'drive-harddisk',
          iconType: 'ICON_NAME',
          rootUri: 'file:///media/System',
          attributes: {}
        }
      ]
    }
  })

  state = reducer(state, action)

  expect(state).toMatch({
    active: {
      0: '/',
      1: '/'
    },
    names: ['/', 'System', 'abc'],
    entities: {
      '/': {
        name: '/',
        icon: 'computer',
        iconType: 'ICON_NAME',
        rootUri: 'file:///',
        attributes: {}
      },
      abc: {
        name: 'abc',
        icon: 'drive-harddisk',
        iconType: 'ICON_NAME',
        rootUri: null,
        uuid: 'abc',
        attributes: {}
      },
      System: {
        name: 'System',
        icon: 'drive-harddisk',
        iconType: 'ICON_NAME',
        rootUri: 'file:///media/System',
        attributes: {}
      }
    }
  })
})
