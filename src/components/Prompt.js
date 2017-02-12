import React from 'react'

export default class Prompt extends React.Component {
  render () {
    return (
      <section className='prompt'>
        <div className='row no-gutters'>
          <div className='col-4 pr-1 text-right text-truncate'>{this.props.location + '>'}</div>
          <div className='col'>
            <div className='input-group input-group-sm'>
              <input className='form-control' />
              <span className='input-group-btn'>
                <button className='btn btn-link'><i className='fa fa-caret-down' /></button>
              </span>
            </div>
          </div>
        </div>
      </section>
    )
  }
}
