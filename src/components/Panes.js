import React from 'react'
import PanesCol from './PanesCol'

export default class Panes extends React.Component {
  render () {
    return (
      <section className='panes'>
        <div className='row no-gutters'>
          <PanesCol
            activeFile={this.props.activeFile[0]}
            isActive={this.props.activePanel === 0}
            files={this.props.files[0]}
            location={this.props.locations[0]}
            onLevelUp={this.props.onLevelUp}
          />

          <PanesCol
            activeFile={this.props.activeFile[1]}
            isActive={this.props.activePanel === 1}
            files={this.props.files[1]}
            location={this.props.locations[1]}
            onLevelUp={this.props.onLevelUp}
          />
        </div>
      </section>
    )
  }
}
