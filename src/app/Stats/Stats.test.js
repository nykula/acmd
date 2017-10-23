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
    const stateProps = new Stats(props).getData();
    expect(stateProps).toEqual({
      selectedCount: 2,
      totalCount: 4,
      selectedSize: 20,
      totalSize: 60,
    });
  });
});

function sampleProps() {
  const panelService = {
    entities: {
      "0": { activeTabId: 0 },
    },
  };

  const tabService = {
    entities: {
      "0": {
        files: [
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
        selected: [0, 2],
      },
    },
  };

  const showHidSysService = {
    state: false,
  };

  return {
    panelId: 0,
    panelService: panelService,
    showHidSysService: showHidSysService,
    tabService: tabService,
  };
}
