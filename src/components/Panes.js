import $ from 'jquery'
import React from 'react'
import PanesCol from './PanesCol'

export default class Panes extends React.Component {
  componentDidMount () {
    $('.directory th').addClass('p-0')
    $('.directory th .btn').addClass('text-left')
    $('.directory td').addClass('py-0')

    $('.directory tbody td').addClass('border-top-0')

    $('.directory tbody').each(function enhanceTbody () {
      const rows = 12 - $(this).children().length

      if (rows < 1) {
        return
      }

      const height = `calc((2 * 1px + 2 * 0.3rem + 1.5rem) * ${rows})`

      $('<tr />').css({ height }).appendTo(this)
    })

    $('.tabs .nav-link').addClass('px-2 py-0')
  }

  render () {
    return (
      <section className='panes'>
        <div className='row no-gutters'>
          <PanesCol
            activeFile={this.props.activeFile[0]}
            isActive={this.props.activePanel === 0}
            files={this.props.files[0]}
          />

          <PanesCol
            activeFile={this.props.activeFile[1]}
            isActive={this.props.activePanel === 1}
            files={this.props.files[1]}
          />
        </div>
      </section>
    )
  }
}
