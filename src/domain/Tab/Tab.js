const { File } = require("../File/File");

class Tab {
  constructor() {
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
}

exports.Tab = Tab;
