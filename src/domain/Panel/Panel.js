class Panel {
  constructor() {
    this.activeTabId = 0;
    this.history = ["file:///"];
    this.now = 0;
    this.tabIds = [0];
  }
}

exports.Panel = Panel;
