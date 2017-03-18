/* global it */
const assign = require('lodash/assign')
const { MountList, mapStateToProps } = require('./MountList')
const h = require('inferno-hyperscript')

it('renders without crashing', () => {
  h(MountList).type(assign(
        { panelId: 0 },
        mapStateToProps({
          locations: { 0: '/' },
          mounts: {
            active: { 0: 'Music', 1: 'System' },
            names: ['System', 'Music'],
            entities: {
              System: {
                name: 'System',
                icon: 'drive-harddisk',
                iconType: 'ICON_NAME',
                root: '/media/System'
              },
              Music: {
                name: 'Music',
                icon: 'media-optical',
                iconType: 'ICON_NAME',
                root: '/media/Music'
              }
            }
          }
        }, { panelId: 0 })
    ))
})
