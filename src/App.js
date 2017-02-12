import $ from 'jquery'
import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import './App.css'
import * as activePanelActions from './actions/activePanel'
import * as actions from './actions'
import MenuBar from './components/MenuBar'
import Toolbar from './components/Toolbar'
import Drives from './components/Drives'
import Panes from './components/Panes'
import Prompt from './components/Prompt'
import Actions from './components/Actions'

const TAB = 9
const UP = 38
const DOWN = 40

class App extends React.Component {
  constructor(props) {
    super(props)

    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleReady = this.handleReady.bind(this)
  }

  componentDidMount () {
    if (this.props.connection.ready) {
      this.handleReady()
    } else {
      this.props.connection.init().then(this.handleReady).catch(err => {
        console.error(err)
      });
    }
  }

  handleKeyDown (ev) {
    if (ev.which === TAB) {
      ev.preventDefault()
      this.props.actions.toggleActivePanel()
      return
    }

    if (ev.which === UP) {
      ev.preventDefault()
      this.props.actions.prevFile()
      return
    }

    if (ev.which === DOWN) {
      ev.preventDefault()
      this.props.actions.nextFile()
      return
    }
  }

  handleReady () {
    this.forceUpdate()

    $('hr').addClass('my-0')

    $('.btn-link').hover(function handleMouseenter () {
      $(this).addClass('btn-secondary').removeClass('btn-link')
    }, function handleMouseleave () {
      $(this).removeClass('btn-secondary').addClass('btn-link')
    })

    $('body').on('keydown', this.handleKeyDown)
  }

  render () {
    return this.props.connection.ready ? (
      <div className='container-fluid px-0'>
        <MenuBar /><hr />
        <Toolbar /><hr />
        <Drives /><hr />
        <Panes
          activeFile={this.props.activeFile}
          activePanel={this.props.activePanel}
          files={this.props.files}
        />
        <Prompt />
        <Actions />
      </div>
    ) : (
      <div className="alert">Loading...</div>
    )
  }
}

function mapStateToProps (state, props) {
  return {
    activePanel: state.activePanel,
    activeFile: state.activeFile,
    connection: state.connection,
    files: state.files
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: {
      ...bindActionCreators(activePanelActions, dispatch),
      ...bindActionCreators(actions, dispatch)
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
