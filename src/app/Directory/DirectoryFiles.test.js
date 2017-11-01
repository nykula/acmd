const Gio = imports.gi.Gio;
const expect = require("expect");
const h = require("inferno-hyperscript").default;
const assign = require("lodash/assign");
const { observable } = require("mobx");
const { createSpy } = expect;
const { DirectoryFiles } = require("./DirectoryFiles");
const { shallow } = require("../Test/Test");

describe("DirectoryFiles", () => {
  it("renders without crashing", () => {
    /** @type {any} */
    const tabService = {
      entities: {
        "0": {
          selected: [1],
        },
      },

      visibleFiles: {
        "0": [
          { name: "foo.bar" },
          { name: "foo.baz" },
        ],
      },
    };

    new DirectoryFiles({
      tabId: 0,
      tabService,
    }).render();
  });
});
