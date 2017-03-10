/* global it */
const assign = require('lodash/assign')
const { VolumeList, mapStateToProps } = require('./VolumeList')
const h = require('inferno-hyperscript')

it('renders without crashing', () => {
  h(VolumeList).type(assign(
        { panelId: 0 },
        mapStateToProps({
          volumes: {
            active: { 0: 'Music', 1: 'System' },
            labels: ['System', 'Music'],
            entities: {
              System: {
                label: 'System',
                icon: 'drive-harddisk'
              },
              Music: {
                label: 'Music',
                icon: 'media-optical'
              }
            }
          }
        })
    ))
})
