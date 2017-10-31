const assign = require("lodash/assign");
const { action, extendObservable, useStrict } = require("mobx");
const { Place } = require("../../domain/Place/Place");
const { autoBind } = require("../Gjs/autoBind");

function PlaceService() {
  autoBind(this, PlaceService.prototype);

  extendObservable(this, {
    entities: this.entities,
    names: this.names,
    set: action(this.set),
  });
}

/** @type {{ [name: string]: Place }} */
PlaceService.prototype.entities = {
  "/": {
    filesystemFree: 0,
    filesystemSize: 0,
    icon: "computer",
    iconType: "ICON_NAME",
    name: "/",
    rootUri: "file:///",
    uuid: null,
  },
};

PlaceService.prototype.names = ["/"];

/**
 * @param {Place[]} places
 */
PlaceService.prototype.set = function(places) {
  this.names = places.map(x => x.name).sort();
  this.entities = places.reduce((prev, x) => {
    prev[x.name] = x;
    return prev;
  }, {});
};

exports.PlaceService = PlaceService;
