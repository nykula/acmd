import React from 'react'
import DrivesCol from './DrivesCol'

export default class Drives extends React.Component {
  render () {
    return (
      <section className='drives'>
        <div className='row no-gutters'>
          <DrivesCol />
          <DrivesCol />
        </div>
      </section>
    )
  }
}
