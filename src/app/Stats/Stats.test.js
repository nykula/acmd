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
      totalCount: 4,
      selectedSize: 20,
      totalSize: 60,
    });
  });
});

function sampleProps() {
  /** @type {*} */
  const panelService = {
    entities: {
      "0": { activeTabId: 0 },
    },
  };

  /** @type {*} */
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
