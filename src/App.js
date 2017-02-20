import $ from 'jquery'
import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import './App.css'
import * as activePanelActions from './actions/activePanel'
import * as actions from './actions'
import * as filesActions from './actions/files'
import * as locationsActions from './actions/locations'
import MenuBar from './components/MenuBar'
import Toolbar from './components/Toolbar'
import Drives from './components/Drives'
import Panes from './components/Panes'
import Prompt from './components/Prompt'
import Actions from './components/Actions'

const BACKSPACE = 8
const TAB = 9
const ENTER = 13
const UP = 38
const DOWN = 40
const F2 = 113
const F3 = 114
const F4 = 115
const F5 = 116
const F6 = 117
const F7 = 118
const F8 = 119

class App extends React.Component {
  constructor (props) {
    super(props)

    this.getActiveFile = this.getActiveFile.bind(this)
    this.handleCopy = this.handleCopy.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleEdit = this.handleEdit.bind(this)
    this.handleLevelDown = this.handleLevelDown.bind(this)
    this.handleLevelUp = this.handleLevelUp.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleMkdir = this.handleMkdir.bind(this)
    this.handleMove = this.handleMove.bind(this)
    this.handleRefresh = this.handleRefresh.bind(this)
    this.handleView = this.handleView.bind(this)
  }

  async componentDidMount () {
    $('body')
      .on('keydown', this.handleKeyDown)
      .on('mouseenter', '.btn-link', function (ev) {
        $(this)
          .addClass('btn-secondary')
          .removeClass('btn-link')
          .one('mouseleave', function () {
            $(this).removeClass('btn-secondary').addClass('btn-link')
          })
      })
    try {
      await this.props.connection.init()
      this.handleRefresh()
    } catch (err) {
      console.error(err)
    }
  }

  componentWillUnmount () {
    $('body').off('keydown mouseenter')
  }

  handleKeyDown (ev) {
    const known = [ BACKSPACE, TAB, ENTER, UP, DOWN, F2, F3, F4, F5, F6, F7, F8 ]

    if (known.indexOf(ev.which) === -1) {
      return
    }

    switch (ev.which) {
      case BACKSPACE:
        return this.handleLevelUp()

      case TAB:
        return this.props.actions.toggleActivePanel()

      case ENTER:
        return this.handleLevelDown()

      case UP:
        return this.props.actions.prevFile()

      case DOWN:
        return this.props.actions.nextFile()

      case F2:
        return this.handleRefresh()

      case F3:
        return this.handleView()

      case F4:
        return this.handleEdit()

      case F5:
        return this.handleCopy()

      case F6:
        return this.handleMove()

      case F7:
        return this.handleMkdir()

      case F8:
        return this.handleDelete()

      default:
        return
    }
  }

  getActiveFile () {
    const activePanel = this.props.activePanel
    const location = this.props.locations[activePanel]
    const activeFile = this.props.activeFile[activePanel]
    const files = this.props.files[activePanel]
    const file = files[activeFile]
    const path = location.replace(/\/?$/, '') + '/' + file.name

    return { ...file, path }
  }

  handleLevelDown () {
    const file = this.getActiveFile()

    if (file.fileType !== 'DIRECTORY') {
      return this.handleView()
    }

    if (file.name === '..') {
      return this.handleLevelUp()
    }

    const activePanel = this.props.activePanel
    this.props.actions.ls(activePanel, file.path)
  }

  handleLevelUp () {
    const activePanel = this.props.activePanel
    const location = this.props.locations[activePanel]
    const nextLocation = location.replace(/\/[^/]+$/, '')
    this.props.actions.ls(activePanel, nextLocation)
  }

  handleView () {
    const path = this.getActiveFile().path
    this.props.connection.view(path)
  }

  handleEdit () {
    const path = this.getActiveFile().path
    this.props.connection.editor(path)
  }

  handleCopy () {
    const file = this.getActiveFile()
    const target = this.props.locations[this.props.activePanel === 0 ? 1 : 0]

    const path = file.path
    let targetPath = target + '/' + file.name

    targetPath = window.prompt('Copy ' + path + ' to:', targetPath)

    if (!targetPath) {
      return
    }

    this.props.actions.cp(path, targetPath)
  }

  handleMove () {
    const file = this.getActiveFile()
    const target = this.props.locations[this.props.activePanel === 0 ? 1 : 0]

    const path = file.path
    let targetPath = target + '/' + file.name

    targetPath = window.prompt('Move ' + path + ' to:', targetPath)

    if (!targetPath) {
      return
    }

    this.props.actions.mv(path, targetPath)
  }

  async handleMkdir () {
    const activePanel = this.props.activePanel
    const location = this.props.locations[activePanel]
    const name = window.prompt('Name of the new dir:').replace(/\//g, '_')
    await this.props.connection.mkdir(location + '/' + name)
    this.handleRefresh()
  }

  handleDelete () {
    const path = this.getActiveFile().path

    if (window.confirm('Are you sure you want to remove ' + path + '?')) {
      this.props.actions.rm(path)
    }
  }

  handleRefresh () {
    this.props.actions.ls(0, this.props.locations[0])
    this.props.actions.ls(1, this.props.locations[1])
  }

  render () {
    return this.props.connection.ready ? (
      <div className='container-fluid px-0'>
        <MenuBar /><hr />
        <Toolbar
          onRefresh={this.handleRefresh}
        /><hr />
        <Drives /><hr />
        <Panes
          activeFile={this.props.activeFile}
          activePanel={this.props.activePanel}
          files={this.props.files}
          locations={this.props.locations}
          onLevelUp={this.handleLevelUp}
        />
        <Prompt
          location={this.props.locations[this.props.activePanel]}
        />
        <Actions
          onView={this.handleView}
          onEdit={this.handleEdit}
          onCopy={this.handleCopy}
          onMove={this.handleMove}
          onMkdir={this.handleMkdir}
          onDelete={this.handleDelete}
        />
      </div>
    ) : (
      <div className='alert'>Loading...</div>
    )
  }
}

function mapStateToProps (state, props) {
  return {
    activePanel: state.activePanel,
    activeFile: state.activeFile,
    connection: state.connection,
    files: state.files,
    locations: state.locations
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: {
      ...bindActionCreators(activePanelActions, dispatch),
      ...bindActionCreators(actions, dispatch),
      ...bindActionCreators(filesActions, dispatch),
      ...bindActionCreators(locationsActions, dispatch)
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
