import React from 'react'
import './PanesCol.css'

export default class PanesCol extends React.Component {
  render () {
    const activeLoc = this.props.isActive ? ' bg-primary text-white' : ''
    const activeLocBtn = this.props.isActive ? ' text-white' : ''
    const loc = this.props.location.replace(/\/?$/, '/*')

    return (
      <div className='col'>
        <div className='medium'>
          <div className='row no-gutters'>
            <div className='col-10 text-truncate'>
              <button className='btn btn-sm btn-secondary'><i className='fa fa-hdd-o' /> e <i className='fa fa-caret-down' /></button>
          [files] 65,623,892 k of 628,600,828 k free
        </div>

            <div className='col text-nowrap text-right'>
              <i className='pipe'>|</i>
              <button className='btn btn-sm btn-link'>\</button>
              <button className='btn btn-sm btn-link' onClick={this.props.onLevelUp}>..</button>
            </div>
          </div>
        </div>

        <div className='tabs'>
          <ul className='nav nav-tabs'>
            <li className='nav-item'>
              <a className='nav-link px-2 py-0' href='#'>1977 animals</a>
            </li>
            <li className='nav-item'>
              <a className='nav-link px-2 py-0 active' href='#'><i className='fa fa-music' /> Music</a>
            </li>
          </ul>
        </div>

        <div className='card border-top-0 rounded-0'>
          <div className={'location' + activeLoc}>
            <div className='row no-gutters'>
              <div className='col-10 active text-truncate'>
                <i className='fa fa-caret-down' /> {loc}
              </div>
              <div className='col text-nowrap text-right'>
                <button className={'btn btn-sm btn-link' + activeLocBtn}><i className='fa fa-asterisk' /></button>
                <button className={'btn btn-sm btn-link' + activeLocBtn}><i className='fa fa-caret-down' /></button>
              </div>
            </div>
          </div>

          <table className='table table-sm mb-0 directory'>
            <thead>
              <tr>
                <th className='p-0'><button className='btn btn-block btn-sm btn-link text-left'>Name</button></th>
                <th className='p-0'><button className='btn btn-block btn-sm btn-secondary active text-left'><i className='fa fa-long-arrow-up' /> Ext</button></th>
                <th className='p-0'><button className='btn btn-block btn-sm btn-link text-left'>Size</button></th>
                <th className='p-0'><button className='btn btn-block btn-sm btn-link text-left'>Date</button></th>
                <th className='p-0'><button className='btn btn-block btn-sm btn-link text-left'>Attr</button></th>
              </tr>
            </thead>
            <tfoot>
              <tr>
                <td className='border-top-0 py-0' colSpan='5'>0 k / 43 k in 0 / 12 file(s)</td>
              </tr>
            </tfoot>
            <tbody>
              {this.props.files.map((file, i) => {
                const name = file.name

                let filename = file.name
                let ext = ''

                const matches = /^(.+)\.(.*?)$/.exec(file.name)

                if (name !== '..' && matches) {
                  filename = matches[1]
                  ext = matches[2]
                }

                if (name === '..') {
                  filename = '[..]'
                }

                const icon = file.fileType === 'DIRECTORY' ? 'folder' : 'file-text'

                const mtime = ((time) => {
                  var date = new Date(time)

                  const month = ('00' + (date.getMonth() + 1)).slice(-2)
                  const day = ('00' + (date.getDate())).slice(-2)
                  const year = ('0000' + (date.getFullYear())).slice(-4)
                  const hours = ('00' + (date.getHours())).slice(-2)
                  const minutes = ('00' + (date.getMinutes())).slice(-2)

                  return [month, day, year].join('/') + ' ' + [hours, minutes].join(':')
                })(file.modificationTime)

                return (
                  <tr className={i === this.props.activeFile && 'table-active'} key={i}>
                    <td className='border-top-0 py-0'><i className={'fa fa-' + icon} /> {filename}</td>
                    <td className='border-top-0 py-0'>{ext}</td>
                    <td className='border-top-0 py-0'>{file.fileType === 'DIRECTORY' ? '<DIR>' : file.size}</td>
                    <td className='border-top-0 py-0'>{mtime}</td>
                    <td className='border-top-0 py-0'>{file.mode}</td>
                  </tr>
                )
              })}
              {this.props.files.length < 17 && (
                <tr style={{ height: `calc(1.5rem * ${17 - this.props.files.length})` }} />
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}
