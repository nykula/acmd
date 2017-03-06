/* global expect, it */

const gio = require('./gio').default
const noop = require('lodash/noop')

it('provides info about drives', () => {
  const gVolMon = {
    get_connected_drives: () => []
  }

  const props = {
    Gio: {
      VolumeMonitor: {
        get: () => gVolMon
      }
    },
    nextTick: x => x()
  }

  const { dispatchRequest, responses } = setup(props)

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

        default:
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

it('lists files in a directory', () => {
  const dirGFile = {
    enumerate_children_async: () => {
      arguments[arguments.length - 1]()
    },

    enumerate_children_finish: () => ({
      next_files_async: () => {
        arguments[arguments.length - 1]()
      },

      next_files_finish: () => [{
        list_attributes: () => ['someNamespace::someKey'],
        get_attribute_as_string: () => 'someValue',
        get_display_name: () => 'file.txt',
        get_file_type: () => 2,
        get_name: () => '?@$/@!#$/*@!)(#</>E',
        get_modification_time: () => ({
          tv_sec: 0
        }),
        get_size: () => 1
      }]
    })
  }

  const props = {
    Gio: {
      FileQueryInfoFlags: {},
      FileType: {
        'typeA': 0,
        'typeB': 0,
        'typeC': 0
      },
      VolumeMonitor: { get: () => null },
      file_new_for_path: () => dirGFile
    },
    GLib: {},
    nextTick: x => x()
  }

  const { dispatchRequest, responses } = setup(props)

  dispatchRequest({
    type: 'LS',
    requestId: 2,
    path: '/',
    panel: 0
  })

  expect(responses[responses.length - 1]).toMatch({
    type: 'LS',
    requestId: 2,
    path: '/',
    panel: 0,
    result: {
      files: [
        {
          displayName: 'file.txt',
          fileType: 'typeC',
          name: '?@$/@!#$/*@!)(#</>E',
          modificationTime: 0,
          size: 1,
          attributes: {
            'someNamespace::someKey': 'someValue'
          }
        }
      ]
    }
  })
})

it('creates a directory', () => {
  const props = {
    Gio: {
      VolumeMonitor: { get: () => null },
      file_new_for_path: () => ({
        make_directory_async: () => {
          arguments[arguments.length - 1]()
        }
      })
    },
    GLib: {},
    nextTick: x => x()
  }

  const { dispatchRequest, responses } = setup(props)

  dispatchRequest({
    type: 'MKDIR',
    requestId: 3,
    path: '/someDir',
    panel: 0
  })

  expect(responses[responses.length - 1]).toMatch({
    type: 'MKDIR',
    requestId: 3,
    path: '/someDir',
    result: {
      ok: true
    }
  })
})

it('mounts a volume', () => {
  const gVolMon = {
    get_volumes: () => [{
      get_identifier: () => 'abc',
      mount: () => {
        arguments[arguments.length - 1]()
      }
    }]
  }

  const props = {
    Gio: {
      MountMountFlags: {},
      VolumeMonitor: { get: () => gVolMon }
    },
    Gtk: {
      MountOperation: function () { }
    },
    nextTick: x => x()
  }

  const { dispatchRequest, responses } = setup(props)

  dispatchRequest({
    type: 'MOUNT_REQUESTED',
    requestId: 4,
    identifier: {
      type: 'uuid',
      value: 'abc'
    }
  })

  expect(responses).toMatch([{
    type: 'MOUNT_REQUESTED',
    requestId: 4,
    ready: true
  }])
})

it('unmounts a volume', () => {
  const gVolMon = {
    get_mounts: () => [{
      get_volume: () => ({
        get_identifier: () => 'def'
      }),
      unmount: () => {
        arguments[arguments.length - 1]()
      }
    }]
  }

  const props = {
    Gio: {
      MountUnmountFlags: {},
      VolumeMonitor: { get: () => gVolMon }
    },
    nextTick: x => x()
  }

  const { dispatchRequest, responses } = setup(props)

  dispatchRequest({
    type: 'UNMOUNT_REQUESTED',
    requestId: 5,
    identifier: {
      type: 'label',
      value: 'def'
    }
  })

  expect(responses).toMatch([{
    type: 'UNMOUNT_REQUESTED',
    requestId: 5,
    ready: true
  }])
})

function setup (props) {
  const responses = []

  const dispatchResponse = (action) => {
    responses.push(action)
  }

  const store = { dispatch: dispatchResponse }
  const next = noop

  return {
    dispatchRequest: gio(props)(store)(next),
    responses: responses
  }
}
