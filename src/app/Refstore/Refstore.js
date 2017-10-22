exports.default = Refstore
function Refstore () {
  this.get = this.get.bind(this)
  this.set = this.set.bind(this)

  this.refs = {}
  this.setters = {}
}

Refstore.prototype.get = function (key) {
  return this.refs[key]
}

Refstore.prototype.set = function (key) {
  if (!this.setters[key]) {
    this.setters[key] = node => {
      this.refs[key] = node
    }
  }

  return this.setters[key]
}
