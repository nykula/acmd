const expect = require("expect");
const { PanelService } = require("../Panel/PanelService");
const { FileService } = require("./FileService");

describe("FileService", () => {
  it("activates panel on selection change", () => {
    /** @type {any} */
    const tabService = {
      cursor() {},
      selected() {},
    };

    const panelService = new PanelService();
    const fileService = new FileService(panelService, tabService);
    panelService.activeId = 0;

    fileService.cursor({
      cursor: 0,
      panelId: 1,
      tabId: 0,
    });

    expect(panelService.activeId).toBe(1);

    fileService.selected({
      panelId: 0,
      selected: [1],
      tabId: 1,
    });

    expect(panelService.activeId).toBe(0);
  });
});
