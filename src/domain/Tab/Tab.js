const { File } = require("../File/File");

function Tab() {
  this.cursor = 0;

  /**
   * @type {File[]}
   */
  this.files = [];

  this.location = "file:///";

  /**
   * @type {number[]}
   */
  this.selected = [];

  this.sortedBy = "ext";
}

exports.Tab = Tab;
