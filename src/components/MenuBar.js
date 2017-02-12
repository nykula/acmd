import React from 'react'

export default class MenuBar extends React.Component {
  render () {
    return (
      <section className='menu-bar'>
        <button className='btn btn-sm btn-link'>Files</button>
        <button className='btn btn-sm btn-link'>Mark</button>
        <button className='btn btn-sm btn-link'>Commands</button>
        <button className='btn btn-sm btn-link'>Net</button>
        <button className='btn btn-sm btn-link'>Show</button>
        <button className='btn btn-sm btn-link'>Configuration</button>
        <button className='btn btn-sm btn-link'>Start</button>
      </section>
    )
  }
}
