const { extendObservable } = require('mobx')

function ShowHidSysService () {
  extendObservable(this, {
    state: this.state
  })
}

ShowHidSysService.prototype.state = false

ShowHidSysService.prototype.toggle = function () {
  this.state = !this.state
}

exports.ShowHidSysService = ShowHidSysService
