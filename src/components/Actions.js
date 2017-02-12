import React from 'react'

export default class Actions extends React.Component {
  render () {
    return (
      <section className='actions'>
        <div className='btn-group btn-group-sm flex-row w-100'>
          <button className='btn btn-secondary w-100'>F3 View</button>
          <button className='btn btn-secondary w-100'>F4 Edit</button>
          <button className='btn btn-secondary w-100'>F5 Copy</button>
          <button className='btn btn-secondary w-100'>F6 Move</button>
          <button className='btn btn-secondary w-100'>F7 NewFolder</button>
          <button className='btn btn-secondary w-100'>F8 Delete</button>
          <button className='btn btn-secondary w-100'>Alt+F4 Exit</button>
        </div>
      </section>
    )
  }
}
