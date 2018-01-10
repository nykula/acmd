class Place {
  constructor() {
    this.canUnmount = false;
    this.filesystemFree = 0;
    this.filesystemSize = 0;
    this.icon = "";
    this.iconType = "";
    this.isShadowed = false;
    this.name = "";
    this.rootUri = /** @type {string | null} */ (null);
    this.uuid = /** @type {string | null} */ (null);
  }
}

exports.Place = Place;
