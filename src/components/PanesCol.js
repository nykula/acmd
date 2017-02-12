import React from 'react'
import './PanesCol.css'

export default class PanesCol extends React.Component {
  render () {
    const activeLoc = this.props.isActive ? ' bg-primary text-white' : ''
    const activeLocBtn = this.props.isActive ? ' text-white' : ''

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
              <button className='btn btn-sm btn-link'>..</button>
            </div>
          </div>
        </div>

        <div className='tabs'>
          <ul className='nav nav-tabs'>
            <li className='nav-item'>
              <a className='nav-link' href='#'>1977 animals</a>
            </li>
            <li className='nav-item'>
              <a className='nav-link active' href='#'><i className='fa fa-music' /> Music</a>
            </li>
          </ul>
        </div>

        <div className='card border-top-0 rounded-0'>
          <div className={'location' + activeLoc}>
            <div className='row no-gutters'>
              <div className='col-10 active text-truncate'>
                <i className='fa fa-caret-down' /> {'c:\\Users\\D\\Music\\*.*'}
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
                <th><button className='btn btn-block btn-sm btn-link'>Name</button></th>
                <th><button className='btn btn-block btn-sm btn-secondary active'><i className='fa fa-long-arrow-up' /> Ext</button></th>
                <th><button className='btn btn-block btn-sm btn-link'>Size</button></th>
                <th><button className='btn btn-block btn-sm btn-link'>Date</button></th>
                <th><button className='btn btn-block btn-sm btn-link'>Attr</button></th>
              </tr>
            </thead>
            <tfoot>
              <tr>
                <td colSpan='5'>0 k / 43 k in 0 / 12 file(s)</td>
              </tr>
            </tfoot>
            <tbody>
              <tr>
                <td><i className='fa fa-level-up' /> [..]</td>
                <td />
                <td>&lt;DIR&gt;</td>
                <td>02/08/2017 00:10</td>
                <td>0755</td>
              </tr>
              <tr>
                <td><i className='fa fa-file-text' /> clan in da front</td>
                <td>txt</td>
                <td>4,110</td>
                <td>02/01/2017 00:07</td>
                <td>0644</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}
