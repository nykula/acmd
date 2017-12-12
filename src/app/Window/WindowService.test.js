const expect = require("expect");
const { WindowService } = require("./WindowService");

describe("WindowService", () => {
  it("reports issue", () => {
    /** @type {any} */
    const Gtk = {
      show_uri: expect.createSpy(),
    };

    const windowService = new WindowService({});
    windowService.Gtk = Gtk;

    windowService.issue();
    expect(Gtk.show_uri.calls[0].arguments[1]).toMatch(/github/);
  });

  it("toggles hidden file visibility", () => {
    /** @type {any} */
    const tabService = {
      showHidSys: undefined,
    };

    const windowService = new WindowService({ tabService });

    windowService.showHidSys();
    expect(tabService.showHidSys).toBe(true);

    windowService.showHidSys();
    expect(tabService.showHidSys).toBe(false);
  });
});
