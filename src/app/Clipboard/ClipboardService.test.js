const expect = require("expect");
const { ClipboardService } = require("./ClipboardService");

describe("ClipboardService", () => {
  it("copies", () => {
    /** @type {any} */
    const gioService = {
      communicate: expect.createSpy(),
    };

    const clipboardService = new ClipboardService({ gioService });
    clipboardService.copy(["file:///foo/bar", "file:///foo/baz"]);

    const argv = gioService.communicate.calls[0].arguments[0];
    expect(/\.py$/.test(argv[0])).toBeTruthy();
    expect(argv[1]).toBe("copy");
  });

  it("cuts", () => {
    /** @type {any} */
    const gioService = {
      communicate: expect.createSpy(),
    };

    const clipboardService = new ClipboardService({ gioService });
    clipboardService.cut(["file:///foo/bar", "file:///foo/baz"]);

    const argv = gioService.communicate.calls[0].arguments[0];
    expect(/\.py$/.test(argv[0])).toBeTruthy();
    expect(argv[1]).toBe("cut");
  });

  it("pastes", () => {
    /** @type {any} */
    const gioService = {
      communicate: expect.createSpy(),
    };

    const callback = expect.createSpy();

    const clipboardService = new ClipboardService({ gioService });
    clipboardService.paste(callback);

    const args = gioService.communicate.calls[0].arguments;
    expect(args[args.length - 1]).toBe(callback);

    const argv = args[0];
    expect(/\.py$/.test(argv[0])).toBeTruthy();
    expect(argv[1]).toBe("paste");
  });
});
