import $ from 'jquery'
import React from 'react'
import MenuBar from './components/MenuBar'
import Toolbar from './components/Toolbar'
import Drives from './components/Drives'
import Panes from './components/Panes'
import Prompt from './components/Prompt'
import Actions from './components/Actions'
import './App.css'

export default class App extends React.Component {
  componentDidMount () {
    $('hr').addClass('my-0')

    $('.btn-link').hover(function handleMouseenter () {
      $(this).addClass('btn-secondary').removeClass('btn-link')
    }, function handleMouseleave () {
      $(this).removeClass('btn-secondary').addClass('btn-link')
    })
  }

  render () {
    return (
      <div className='container-fluid px-0'>
        <MenuBar /><hr />
        <Toolbar /><hr />
        <Drives /><hr />
        <Panes />
        <Prompt />
        <Actions />
      </div>
    )
  }
}
