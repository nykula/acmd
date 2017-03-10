/* global it */
const assign = require('lodash/assign')
const h = require('inferno-hyperscript')
const noop = require('lodash/noop')
const { Panel, mapStateToProps, mapDispatchToProps, renderFile } = require('./Panel')

const props = { id: 0 }

const files = [
  {
    name: '..',
    fileType: 'DIRECTORY',
    modificationTime: 0,
    size: 0
  },
  { name: '.viminfo' },
  { name: 'himem.sys' }
]

const state = {
  files: {
    active: { 0: 1 },
    byPanel: { 0: files },
    sortedBy: { 0: 'ext' }
  },
  locations: { 0: '/' },
  panels: {
    active: 0
  },
  tabs: {
    0: {
      active: 1,
      ids: [1],
      entities: {
        1: {
          id: 1,
          text: 'Music',
          icon: 'folder-music'
        }
      }
    }
  },
  volumes: {
    active: { 0: 'System' },
    labels: ['System'],
    entities: {
      System: {
        label: 'System',
        icon: 'media-harddisk'
      }
    }
  }
}

it('renders without crashing', () => {
  h(Panel).type(assign(
    props,
    mapStateToProps(state, props),
    mapDispatchToProps(noop))
  )

  files.forEach(renderFile)
})
