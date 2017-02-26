/* global expect, it */

const gio = require('./gio').default
const noop = require('lodash/noop')

it('provides info about drives', (done) => {
  const { dispatchRequest, gVolMon, responses } = setup()

  gVolMon.get_connected_drives = () => [{
    has_media: () => true,
    enumerate_identifiers: () => [
      'class',
      'unix-device',
      'uuid',
      'label'
    ],
    get_identifier: (x) => {
      switch (x) {
        case 'class':
          return 'device'

        case 'unix-device':
          return '/dev/sda'

        case 'uuid':
          return 'abc'

        case 'label':
          return 'System'
      }
    },
    get_volumes: () => [{
      enumerate_identifiers: () => ['uuid'],
      get_identifier: () => null,
      get_mount: () => ({
        get_root: () => ({
          get_uri: () => '/media/System'
        })
      })
    }]
  }]

  dispatchRequest({
    type: 'DRIVES_REQUESTED',
    requestId: 1
  })

  expect(responses[responses.length - 1]).toMatch({
    type: 'DRIVES_REQUESTED',
    requestId: 1,
    ready: true,
    result: {
      drives: [{
        hasMedia: true,
        identifiers: {
          class: 'device',
          'unix-device': '/dev/sda',
          uuid: 'abc',
          label: 'System'
        },
        volumes: [{
          mount: {
            root: { uri: '/media/System' }
          },
          identifiers: { uuid: null }
        }]
      }]
    }
  })
})

function setup () {
  const responses = []

  const dispatchResponse = (action) => {
    responses.push(action)
  }

  const gVolMon = {
    get_connected_drives: () => []
  }

  const props = {
    Gio: {
      VolumeMonitor: {
        get: () => gVolMon
      }
    },
    GLib: {},
    Gtk: {},
    nextTick: x => x()
  }

  const store = { dispatch: dispatchResponse }
  const next = noop

  return {
    dispatchRequest: gio(props)(store)(next),
    gVolMon: gVolMon,
    responses: responses
  }
}
