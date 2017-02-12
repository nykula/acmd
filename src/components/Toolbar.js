import React from 'react'

export default class Toolbar extends React.Component {
  render () {
    return (
      <section className='toolbar'>
        <button className='btn btn-sm btn-link'><i className='fa fa-refresh' /></button>
        <i className='pipe'>|</i>
        <button className='btn btn-sm btn-link'><i className='fa fa-list' /></button>
        <button className='btn btn-sm btn-secondary active'><i className='fa fa-table' /></button>
        <button className='btn btn-sm btn-link'><i className='fa fa-image' /></button>
        <button className='btn btn-sm btn-link'><i className='fa fa-tree' /></button>
        <i className='pipe'>|</i>
        <button className='btn btn-sm btn-link'><i className='fa fa-sitemap' /></button>
        <i className='pipe'>|</i>
        <button className='btn btn-sm btn-link'><i className='fa fa-asterisk' /></button>
        <i className='pipe'>|</i>
        <button className='btn btn-sm btn-link'><i className='fa fa-arrow-left' /></button>
        <button className='btn btn-sm btn-link'><i className='fa fa-arrow-right' /></button>
        <i className='pipe'>|</i>
        <button className='btn btn-sm btn-link'><i className='fa fa-compress' /></button>
        <button className='btn btn-sm btn-link'><i className='fa fa-expand' /></button>
        <i className='pipe'>|</i>
        <button className='btn btn-sm btn-link'><i className='fa fa-cloud' /></button>
        <button className='btn btn-sm btn-link'><i className='fa fa-download' /></button>
        <i className='pipe'>|</i>
        <button className='btn btn-sm btn-link'><i className='fa fa-search' /></button>
        <button className='btn btn-sm btn-link'><i className='fa fa-pencil' /></button>
        <button className='btn btn-sm btn-link'><i className='fa fa-exchange' /></button>
        <button className='btn btn-sm btn-link'><i className='fa fa-map-marker' /></button>
        <i className='pipe'>|</i>
        <button className='btn btn-sm btn-link'><i className='fa fa-pencil-square-o' /></button>
        <button className='btn btn-sm btn-link'><i className='fa fa-exclamation' /></button>
      </section>
    )
  }
}
