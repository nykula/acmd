import React from 'react'

export default class Actions extends React.Component {
  render () {
    const btn = 'btn btn-secondary w-100'

    return (
      <section className='actions'>
        <div className='btn-group btn-group-sm flex-row w-100'>
          <button className={btn} onClick={this.props.onView}>F3 View</button>
          <button className={btn} onClick={this.props.onEdit}>F4 Edit</button>
          <button className={btn} onClick={this.props.onCopy}>F5 Copy</button>
          <button className={btn} onClick={this.props.onMove}>F6 Move</button>
          <button className={btn} onClick={this.props.onMkdir}>F7 NewFolder</button>
          <button className={btn} onClick={this.props.onDelete}>F8 Delete</button>
          <button className={btn}>Alt+F4 Exit</button>
        </div>
      </section>
    )
  }
}
