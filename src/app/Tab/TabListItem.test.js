const expect = require("expect");
const h = require("inferno-hyperscript").default;
const assign = require("lodash/assign");
const noop = require("lodash/noop");
const { shallow } = require("../Test/Test");
const { TabListItem } = require("./TabListItem");

describe("TabListItem", () => {
  it("renders without crashing", () => {
    const tabService = {
      entities: {
        "0": { location: "file:///" },
        "1": { location: "sftp:///test@example.com/foo/bar" },
      },
    };

    shallow(
      h(TabListItem, {
        id: 0,
        panelId: 1,
        tabService: tabService,
      }),
    );

    shallow(
      h(TabListItem, {
        id: 1,
        panelId: 1,
        tabService: tabService,
      }),
    );
  });

  it("requests active tab change on click without crashing", () => {
    /**
     * @type {*}
     */
    const tabService = {
      entities: {
        "0": { location: "file:///" },
        "1": { location: "sftp:///test@example.com/foo/bar" },
      },
    };

    let _id = -1;
    let _tabId = -1;

    /**
     * @type {*}
     */
    const panelService = {
      setActiveTabId: ({ id, tabId }) => {
        _id = id;
        _tabId = tabId;
      },
    };

    new TabListItem({
      active: false,
      icon: "",
      id: 0,
      panelId: 1,
      panelService: panelService,
      tabService: tabService,
    })
      .handleClicked();

    expect(_id).toEqual(1);
    expect(_tabId).toEqual(0);
  });
});
