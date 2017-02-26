/* global imports */

const Gtk = imports.gi.Gtk
const h = require('virtual-dom/h')
const noop = require('lodash/noop')
const ActionBar = require('./components/ActionBar')
const MenuBar = require('./components/MenuBar')
const Panel = require('./components/Panel')
const Prompt = require('./components/Prompt')
const Toolbar = require('./components/Toolbar')
const VolumeList = require('./components/VolumeList')

exports.render = ({ dispatch }) => (
  h('box', { orientation: Gtk.Orientation.VERTICAL }, [
    MenuBar.render(),
    Toolbar.render(),
    h('h-separator'),
    h('h-box', [
      VolumeList.render({ panel: 0, volumes: state.volumes }),
      VolumeList.render({ panel: 1, volumes: state.volumes })
    ]),
    h('h-separator'),
    h('h-box', { spacing: 1 }, [
      [0, 1].map(panelId => Panel.render({
        activeFile: state.activeFile[panelId],
        files: state.files[panelId],
        id: panelId,
        isActive: state.activePanel === panelId,
        key: panelId,
        location: state.locations[panelId],
        onLevelUp: noop,
        onVolumeChanged: noop,
        tabs: state.tabs[panelId],
        volumes: state.volumes
      }))
    ]),
    Prompt.render({ location: state.locations[state.activePanel] }),
    ActionBar.render({ dispatch: dispatch })
  ])
)

const sampleFiles = [
  {
    name: '..',
    fileType: 'DIRECTORY',
    size: 0,
    modificationTime: Date.now(),
    mode: '0755'
  },
  {
    name: 'clan in da front.txt',
    size: 4110,
    modificationTime: Date.now(),
    mode: '0644'
  }
]

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

const state = {
  activeFile: {
    0: 0,
    1: 0
  },
  activePanel: 0,
  files: {
    0: sampleFiles,
    1: sampleFiles
  },
  locations: {
    0: '/',
    1: '/'
  },
  tabs: {
    0: sampleTabs,
    1: sampleTabs
  },
  volumes: {
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
}
