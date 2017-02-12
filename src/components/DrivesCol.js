import React from 'react'

export default class DrivesCol extends React.Component {
  render () {
    return (
      <div className='col'>
        <button className='btn btn-sm btn-link'><i className='fa fa-hdd-o' /> c</button>
        <button className='btn btn-sm btn-link'><i className='fa fa-hdd-o' /> d</button>
        <button className='btn btn-sm btn-secondary active'><i className='fa fa-hdd-o' /> e</button>
        <button className='btn btn-sm btn-link'><i className='fa fa-globe' /> net</button>
      </div>
    )
  }
}
