const expect = require("expect");
const { h } = require("../Gjs/GtkInferno");
const { shallow } = require("../Test/Test");
const { Prompt } = require("./Prompt");

describe("Prompt", () => {
  it("renders without crashing", () => {
    /** @type {any} */
    const directoryService = {};

    /** @type {any} */
    const panelService = {
      getActiveTab: () => ({ location: "file:///" }),
    };

    shallow(
      h(Prompt, {
        directoryService,
        panelService,
      }),
    );
  });

  it("dispatches action when user activates field", () => {
    /** @type {any} */
    const directoryService = {
      exec: expect.createSpy(),
    };

    /** @type {any} */
    const panelService = {};

    /** @type {any} */
    const entry = {
      /**
       * @param {"activate"} _
       * @param {(self: any) => void} callback
       */
      connect: (_, callback) => callback(entry),
      text: "x-terminal-emulator -e ranger",
    };

    new Prompt({
      directoryService,
      panelService,
    }).ref(entry);

    expect(directoryService.exec).toHaveBeenCalledWith("x-terminal-emulator -e ranger");
  });
});
