const expect = require("expect");
const assign = require("lodash/assign");
const { Prompt, mapStateToProps, mapDispatchToProps } = require("./Prompt");
const h = require("inferno-hyperscript").default;
const { EXEC } = require("../Action/Action");

it("dispatches action when user activates field", () => {
  const actions = [];
  const dispatch = action => actions.push(action);
  const tree = h(Prompt).type(assign({},
    mapStateToProps({
      activePanelId: 0,
      entities: {
        panels: {
          "0": { activeTabId: 0 },
        },
        tabs: {
          "0": { location: "file:///" },
        },
      },
    }),
    mapDispatchToProps(dispatch),
  ));
  const entry = tree.children.filter(x => x.type === "entry")[0];
  entry.events.on_activate({ text: "x-terminal-emulator -e ranger" });
  expect(actions).toContain({ type: EXEC, cmd: "x-terminal-emulator -e ranger" });
});
