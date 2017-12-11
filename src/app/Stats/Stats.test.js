const expect = require("expect");
const h = require("inferno-hyperscript").default;
const { Stats } = require("./Stats");
const { shallow } = require("../Test/Test");

describe("Stats", () => {
  it("renders without crashing", () => {
    const props = sampleProps();
    shallow(h(Stats, props));
  });

  it("counts total size of selected files", () => {
    const props = sampleProps();
    expect(new Stats(props).data).toEqual({
      selectedCount: 2,
      selectedSize: 20,
      totalCount: 4,
      totalSize: 60,
    });
  });
});

function sampleProps() {
  /** @type {any} */
  const panelService = {
    getActiveTabId: () => 0,
  };

  /** @type {any} */
  const tabService = {
    entities: {
      "0": {
        selected: [0, 2],
      },
    },
    showHidSys: false,
    visibleFiles: {
      "0": [
        {
          name: "foo",
          size: 0,
        },
        {
          name: "bar",
          size: 10,
        },
        {
          name: "baz",
          size: 20,
        },
        {
          name: "qux",
          size: 30,
        },
      ],
    },
  };

  return {
    panelId: 0,
    panelService,
    tabService,
  };
}
