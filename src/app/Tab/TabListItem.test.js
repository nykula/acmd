const expect = require("expect");
const assign = require("lodash/assign");
const noop = require("lodash/noop");
const { h } = require("../Gjs/GtkInferno");
const { shallow } = require("../Test/Test");
const { TabListItem } = require("./TabListItem");

describe("TabListItem", () => {
  it("renders without crashing", () => {
    /** @type {any} */
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
        tabService,
      }),
    );

    shallow(
      h(TabListItem, {
        id: 1,
        panelId: 1,
        tabService,
      }),
    );
  });

  it("requests active tab change on click without crashing", () => {
    /**
     * @type {any}
     */
    const tabService = {
      entities: {
        "0": { location: "file:///" },
        "1": { location: "sftp:///test@example.com/foo/bar" },
      },
    };

    /**
     * @type {any}
     */
    const panelService = {
      setActiveTab: expect.createSpy(),
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

    expect(panelService.setActiveTab).toHaveBeenCalledWith(0);
  });
});
