function File() {
  this.attributes = {};
  this.contentType = "";
  this.fileType = "";
  this.handlers = [];
  this.icon = "";
  this.iconType = "";
  this.modificationTime = 0;
  this.mountUri = "";
  this.name = "";
  this.size = 0;
  this.uri = "";
}

exports.File = File;
