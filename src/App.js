import $ from 'jquery'
import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import './App.css'
import * as activePanelActions from './actions/activePanel'
import MenuBar from './components/MenuBar'
import Toolbar from './components/Toolbar'
import Drives from './components/Drives'
import Panes from './components/Panes'
import Prompt from './components/Prompt'
import Actions from './components/Actions'

const TAB = 9

class App extends React.Component {
  componentDidMount () {
    this.handleKeyDown = this.handleKeyDown.bind(this)

    $('hr').addClass('my-0')

    $('.btn-link').hover(function handleMouseenter () {
      $(this).addClass('btn-secondary').removeClass('btn-link')
    }, function handleMouseleave () {
      $(this).removeClass('btn-secondary').addClass('btn-link')
    })

    $('body').on('keydown', this.handleKeyDown);
  }

  handleKeyDown (ev) {
    if (ev.which === TAB) {
      ev.preventDefault()
      this.props.actions.toggleActivePanel()
    }
  }

  render () {
    return (
      <div className='container-fluid px-0'>
        <MenuBar /><hr />
        <Toolbar /><hr />
        <Drives /><hr />
        <Panes active={this.props.activePanel} />
        <Prompt />
        <Actions />
      </div>
    )
  }
}

function mapStateToProps (state, props) {
  return {
    activePanel: state.activePanel
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(activePanelActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
