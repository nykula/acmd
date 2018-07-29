const expect =  require("expect");
const { ActionService } = require("./ActionService");

describe("ActionService", () => {
  it("stores action", () => {
    const windowService = {
      exit: expect.createSpy(),
    };

    const actionService = new ActionService({ windowService });
    const { handler } = actionService.get("windowService.exit");

    handler();
    expect(windowService.exit).toHaveBeenCalledWith();
  });

  it("stores action, warning if not found", () => {
    const actionService = new ActionService({});

    const print = expect.createSpy();
    actionService.print = print;

    const { handler } = actionService.get("windowService.exit");
    handler();

    expect(/windowService.exit/.test(print.calls[0].arguments[0]))
      .toBeTruthy();
  });

  it("gets same action on repeated call", () => {
    const windowService = {
      exit: expect.createSpy(),
    };

    const actionService = new ActionService({ windowService });

    const action = actionService.get("windowService.exit");
    const action1 = actionService.get("windowService.exit");

    expect(action).toBe(action1);
  });
});
