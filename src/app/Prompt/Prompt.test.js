const expect = require("expect");
const h = require("inferno-hyperscript").default;
const { shallow } = require("../Test/Test");
const { Prompt } = require("./Prompt");

describe("Prompt", () => {
  it("renders without crashing", () => {
    shallow(
      h(Prompt, {
        actionService: {},

        panelService: {
          getActiveTabId: () => 0,
        },

        tabService: {
          entities: {
            "0": { location: "file:///" },
          },
        },
      }),
    );
  });

  it("dispatches action when user activates field", () => {
    const cmds = [];

    /**
     * @type {any}
     */
    const actionService = {
      exec: (cmd) => cmds.push(cmd),
    };

    /**
     * @type {any}
     */
    const panelService = {};

    /**
     * @type {any}
     */
    const tabService = {};

    new Prompt({
      actionService: actionService,
      panelService: panelService,
      tabService: tabService,
    })
      .activate({ text: "x-terminal-emulator -e ranger" });

    expect(cmds).toEqual(["x-terminal-emulator -e ranger"]);
  });
});
