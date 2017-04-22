/* global expect, it */

const actions = require('../actions')
const GioAdapter = require('../adapters/Gio').default
const middleware = require('.').default
const noop = require('lodash/noop')

it('provides info about drives', () => {
  const gVolMon = {
    get_connected_drives: () => []
  }

  const props = {
    Gio: {
      File: {
        new_for_uri: () => ({
          query_filesystem_info: () => ({
            get_attribute_as_string: () => 1,
            list_attributes: () => ['filesystem::free']
          })
        })
      },
      VolumeMonitor: {
        get: () => gVolMon
      }
    }
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
        get_name: () => 'System',
        get_icon: () => ({
          to_string: () => '. GThemedIcon drive-harddisk-usb drive-harddisk drive'
        }),
        get_root: () => ({
          get_uri: () => 'file:///media/System',
          query_filesystem_info: () => ({
            get_attribute_as_string: () => 1,
            list_attributes: () => ['filesystem::free']
          })
        })
      })
    }]
  }]

  gVolMon.get_mounts = () => [
    {
      get_name: () => 'foo on bar.example.com',
      get_icon: () => ({
        to_string: () => '. GThemedIcon folder-remote folder'
      }),
      get_root: () => ({
        get_uri: () => 'sftp:///foo@bar.example.com/',
        query_filesystem_info: () => ({
          get_attribute_as_string: () => 1,
          list_attributes: () => ['filesystem::free']
        })
      })
    },
    {
      get_name: () => 'System',
      get_icon: () => ({
        to_string: () => '. GThemedIcon drive-harddisk-usb drive-harddisk drive'
      }),
      get_root: () => ({
        get_uri: () => 'file:///media/System',
        query_filesystem_info: () => ({
          get_attribute_as_string: () => 1,
          list_attributes: () => ['filesystem::free']
        })
      })
    }
  ]

  dispatchRequest({
    type: actions.DRIVES,
    requestId: 1
  })

  expect(responses[responses.length - 1]).toMatch({
    type: actions.DRIVES,
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
            name: 'System',
            icon: '. GThemedIcon drive-harddisk-usb drive-harddisk drive',
            iconType: 'GICON',
            rootUri: 'file:///media/System',
            attributes: { 'filesystem::free': 1 }
          },
          identifiers: { uuid: null }
        }]
      }],
      mounts: [
        {
          name: '/',
          icon: 'computer',
          iconType: 'ICON_NAME',
          rootUri: 'file:///',
          attributes: { 'filesystem::free': 1 }
        },
        {
          name: 'foo on bar.example.com',
          icon: '. GThemedIcon folder-remote folder',
          iconType: 'GICON',
          rootUri: 'sftp:///foo@bar.example.com/',
          attributes: { 'filesystem::free': 1 }
        },
        {
          name: 'System',
          icon: '. GThemedIcon drive-harddisk-usb drive-harddisk drive',
          iconType: 'GICON',
          rootUri: 'file:///media/System',
          attributes: { 'filesystem::free': 1 }
        }
      ]
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
        get_content_type: () => 'text/plain',
        get_display_name: () => 'file.txt',
        get_file_type: () => 2,
        get_icon: () => ({
          to_string: () => 'some gio icon'
        }),
        get_name: () => '?@$/@!#$/*@!)(#</>E',
        get_modification_time: () => ({
          tv_sec: 0
        }),
        get_size: () => 1
      }]
    }),

    get_child: name => ({
      get_uri: () => 'file:///' + name
    }),

    get_parent: () => null,

    get_uri: () => 'file:///',

    query_info_async: () => {
      arguments[arguments.length - 1]()
    },

    query_info_finish: () => ({
      list_attributes: () => ['someNamespace::someKey'],
      get_attribute_as_string: () => 'someValue',
      get_content_type: () => 'inode/directory',
      get_display_name: () => '/',
      get_file_type: () => 1,
      get_icon: () => ({
        to_string: () => 'some gio icon'
      }),
      get_name: () => '/',
      get_modification_time: () => ({
        tv_sec: 0
      }),
      get_size: () => 1
    })
  }

  const props = {
    Gio: {
      AppInfo: {
        get_all_for_type: () => [
          {
            get_commandline: () => '/usr/share/code/code --unity-launch %U',
            get_display_name: () => 'Visual Studio Code',
            get_icon: () => ({
              to_string: () => 'code'
            })
          },
          {
            get_commandline: () => '/usr/bin/gedit %U',
            get_display_name: () => 'Text Editor',
            get_icon: () => ({
              to_string: () => 'gedit'
            })
          },
          {
            get_commandline: () => '/usr/bin/foobar %U',
            get_display_name: () => 'Foobar',
            get_icon: () => null
          },
          {
            get_commandline: () => '/usr/bin/gedit %U',
            get_display_name: () => 'Text Editor',
            get_icon: () => ({
              to_string: () => 'gedit'
            })
          }
        ],
        get_default_for_type: () => ({
          get_commandline: () => '/usr/bin/gedit %U',
          get_display_name: () => 'Text Editor',
          get_icon: () => ({
            to_string: () => 'gedit'
          })
        })
      },
      FileQueryInfoFlags: { NONE: 0 },
      FileType: {
        'typeA': 0,
        'typeB': 0,
        'typeC': 0
      },
      VolumeMonitor: { get: () => null },
      file_new_for_uri: () => dirGFile
    },
    GLib: {
      MAXINT32: 2147483647,
      PRIORITY_DEFAULT: 0
    }
  }

  const { dispatchRequest, responses } = setup(props)

  dispatchRequest({
    type: actions.LS,
    requestId: 2,
    uri: 'file:///',
    tabId: 0
  })

  expect(responses[responses.length - 1]).toMatch({
    type: actions.LS,
    requestId: 2,
    uri: 'file:///',
    tabId: 0,
    result: {
      files: [
        {
          contentType: 'inode/directory',
          displayName: '.',
          fileType: 'typeB',
          icon: 'some gio icon',
          iconType: 'GICON',
          name: '.',
          modificationTime: 0,
          size: 1,
          attributes: {
            'someNamespace::someKey': 'someValue'
          },
          handlers: [
            {
              commandline: '/usr/bin/gedit %U',
              displayName: 'Text Editor',
              icon: 'gedit'
            },
            {
              commandline: '/usr/share/code/code --unity-launch %U',
              displayName: 'Visual Studio Code',
              icon: 'code'
            },
            {
              commandline: '/usr/bin/foobar %U',
              displayName: 'Foobar',
              icon: null
            }
          ]
        },
        {
          contentType: 'text/plain',
          displayName: 'file.txt',
          fileType: 'typeC',
          icon: 'some gio icon',
          iconType: 'GICON',
          name: '?@$/@!#$/*@!)(#</>E',
          modificationTime: 0,
          size: 1,
          attributes: {
            'someNamespace::someKey': 'someValue'
          },
          handlers: [
            {
              commandline: '/usr/bin/gedit %U',
              displayName: 'Text Editor',
              icon: 'gedit'
            },
            {
              commandline: '/usr/share/code/code --unity-launch %U',
              displayName: 'Visual Studio Code',
              icon: 'code'
            },
            {
              commandline: '/usr/bin/foobar %U',
              displayName: 'Foobar',
              icon: null
            }
          ]
        }
      ]
    }
  })
})

it('creates a directory', () => {
  const props = {
    Gio: {
      VolumeMonitor: { get: () => null },
      file_new_for_uri: () => ({
        make_directory_async: () => {
          arguments[arguments.length - 1]()
        }
      })
    },
    GLib: { PRIORITY_DEFAULT: 0 }
  }

  const { dispatchRequest, responses } = setup(props)

  dispatchRequest({
    type: actions.MKDIR,
    requestId: 3,
    uri: 'file:///someDir',
    panel: 0
  })

  expect(responses[responses.length - 1]).toMatch({
    type: actions.MKDIR,
    requestId: 3,
    uri: 'file:///someDir',
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
      MountMountFlags: { NONE: 0 },
      VolumeMonitor: { get: () => gVolMon }
    },
    Gtk: {
      MountOperation: function () { }
    }
  }

  const { dispatchRequest, responses } = setup(props)

  dispatchRequest({
    type: actions.MOUNT,
    requestId: 4,
    identifier: {
      type: actions.uuid,
      value: 'abc'
    }
  })

  expect(responses).toMatch([{
    type: actions.MOUNT,
    requestId: 4,
    ready: true
  }])
})

it('unmounts a volume', () => {
  const props = {
    Gio: {
      File: {
        new_for_uri: () => ({
          find_enclosing_mount: () => ({
            unmount: () => {
              arguments[arguments.length - 1]()
            }
          })
        })
      },
      MountUnmountFlags: { NONE: 0 },
      VolumeMonitor: { get: noop }
    }
  }

  const { dispatchRequest, responses } = setup(props)

  dispatchRequest({
    type: actions.UNMOUNT,
    requestId: 5,
    uri: 'file:///media/Test'
  })

  expect(responses).toMatch([{
    type: actions.UNMOUNT,
    requestId: 5,
    ready: true
  }])
})

it('opens a terminal in the current directory', () => {
  const props = {
    getState: () => ({
      activePanelId: 0,
      entities: {
        panels: {
          '0': { activeTabId: 0 }
        },
        tabs: {
          '0': { location: 'file:///' }
        }
      }
    }),
    Gio: {
      SubprocessFlags: { NONE: 0 },
      SubprocessLauncher: function () {
        this.set_cwd = noop
        this.set_flags = noop
        this.spawnv = noop
      },
      VolumeMonitor: { get: noop }
    }
  }

  const { dispatchRequest } = setup(props)
  dispatchRequest({ type: actions.TERMINAL })
})

function setup (props) {
  props.gioAdapter = new GioAdapter(props)

  const responses = []

  const dispatchResponse = (action) => {
    responses.push(action)
  }

  const store = {
    dispatch: dispatchResponse,
    getState: props.getState || noop
  }

  const next = noop

  return {
    dispatchRequest: middleware(props)(store)(next),
    responses: responses
  }
}
