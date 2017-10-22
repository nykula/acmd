const assign = require("lodash/assign");
const { extendObservable } = require("mobx");

function MountService() {
  extendObservable(this, {
    entities: this.entities,
    names: this.names,
  });
}

MountService.prototype.entities = {
  "/": {
    name: "/",
    icon: "computer",
    iconType: "ICON_NAME",
    rootUri: "file:///",
    attributes: {},
  },
};

MountService.prototype.names = ["/"];

/**
 * @param {{ drives: any[], mounts: any[] }} props
 */
MountService.prototype.set = function(props) {
  let mounts = [];

  mounts = mounts.concat(props.drives.reduce((prev, drive) => {
    return prev.concat(drive.volumes.map(volume => volume.mount || {
      uuid: volume.identifiers.uuid,
      name: volume.identifiers.label || volume.identifiers.uuid,
      icon: "drive-harddisk",
      iconType: "ICON_NAME",
      rootUri: null,
      attributes: {},
    }));
  }, []));

  mounts = mounts.concat(props.mounts);

  mounts = mounts.filter((x, i, xs) => {
    for (let j = 0; j < i; j++) {
      if (xs[j].name === x.name) {
        return false;
      }
    }

    return true;
  });

  this.names = mounts.map(x => x.name).sort();
  this.entities = mounts.reduce((prev, x) => {
    prev[x.name] = x;
    return prev;
  }, {});
};

exports.MountService = MountService;
