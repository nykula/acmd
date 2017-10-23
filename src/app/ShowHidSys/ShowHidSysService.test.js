const expect = require("expect");
const { ShowHidSysService } = require("./ShowHidSysService");

describe("ShowHidSysService", () => {
  it("toggles hidden file visibility", () => {
    const showHidSysService = new ShowHidSysService();
    showHidSysService.state = undefined;

    showHidSysService.toggle();
    expect(showHidSysService.state).toEqual(true);

    showHidSysService.toggle();
    expect(showHidSysService.state).toEqual(false);
  });
});
