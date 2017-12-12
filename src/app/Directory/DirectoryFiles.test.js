const { DirectoryFiles } = require("./DirectoryFiles");

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
