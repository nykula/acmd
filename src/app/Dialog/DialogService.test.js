const { ResponseType } = imports.gi.Gtk;
const expect = require("expect");
const { noop } = require("lodash");
const { DialogService } = require("./DialogService");

describe("DialogService", () => {
  it("alerts", () => {
    /** @type {any} */
    const win = undefined;

    /** @type {any} */
    const MessageDialog = class {
      connect() {
        this.destroy = noop;
        this.show = arguments[arguments.length - 1];
      }
    };

    const dialogService = new DialogService(win);
    dialogService.MessageDialog = MessageDialog;

    dialogService.alert("Success.");
  });

  it("alerts, with callback", () => {
    /** @type {any} */
    const win = undefined;

    /** @type {any} */
    const MessageDialog = class {
      connect() {
        this.destroy = noop;
        this.show = arguments[arguments.length - 1];
      }
    };

    const dialogService = new DialogService(win);
    dialogService.MessageDialog = MessageDialog;

    const callback = expect.createSpy();
    dialogService.alert("Success.", callback);
    expect(callback).toHaveBeenCalled();
  });

  it("confirms", () => {
    /** @type {any} */
    const win = undefined;

    /** @type {any} */
    const MessageDialog = class {
      connect() {
        const handleResponse = arguments[arguments.length - 1];

        this.destroy = noop;
        this.show = () => handleResponse(this, ResponseType.YES);
      }
    };

    const dialogService = new DialogService(win);
    dialogService.MessageDialog = MessageDialog;

    const callback = expect.createSpy();
    dialogService.confirm("Really?", callback);
    expect(callback).toHaveBeenCalledWith(true);
  });

  it("confirms, false if no", () => {
    /** @type {any} */
    const win = undefined;

    /** @type {any} */
    const MessageDialog = class {
      connect() {
        const handleResponse = arguments[arguments.length - 1];

        this.destroy = noop;
        this.show = () => handleResponse(this, ResponseType.NO);
      }
    };

    const dialogService = new DialogService(win);
    dialogService.MessageDialog = MessageDialog;

    const callback = expect.createSpy();
    dialogService.confirm("Really?", callback);
    expect(callback).toHaveBeenCalledWith(false);
  });

  it("confirms, null if closed", () => {
    /** @type {any} */
    const win = undefined;

    /** @type {any} */
    const MessageDialog = class {
      connect() {
        const handleResponse = arguments[arguments.length - 1];

        this.destroy = noop;
        this.show = () => handleResponse(this, "Something else");
      }
    };

    const dialogService = new DialogService(win);
    dialogService.MessageDialog = MessageDialog;

    const callback = expect.createSpy();
    dialogService.confirm("Really?", callback);
    expect(callback).toHaveBeenCalledWith(null);
  });

  it("prompts, handling enter key", () => {
    /** @type {any} */
    const win = undefined;

    let receivedCallback = noop;

    /** @type {any} */
    const Entry = class {
      connect() {
        this.text = "file:///";
        receivedCallback = arguments[arguments.length - 1];
      }
    };

    /** @type {any} */
    const MessageDialog = class {
      constructor() {
        this.connect = noop;
        this.destroy = noop;
      }

      get_content_area() {
        return { add: noop };
      }

      show_all() {
        receivedCallback();
      }
    };

    const dialogService = new DialogService(win);
    dialogService.Entry = Entry;
    dialogService.MessageDialog = MessageDialog;

    const callback = expect.createSpy();
    dialogService.prompt("Where?", "", callback);
    expect(callback).toHaveBeenCalledWith("file:///");
  });

  it("prompts, handling ok button", () => {
    /** @type {any} */
    const win = undefined;

    /** @type {any} */
    const Entry = class {
      connect() {
        this.text = "file:///";
      }
    };

    /** @type {any} */
    const MessageDialog = class {
      connect() {
        const handleResponse = arguments[arguments.length - 1];

        this.destroy = noop;
        this.show_all = () => handleResponse(undefined, ResponseType.OK);
      }

      get_content_area() {
        return { add: noop };
      }
    };

    const dialogService = new DialogService(win);
    dialogService.Entry = Entry;
    dialogService.MessageDialog = MessageDialog;

    const callback = expect.createSpy();
    dialogService.prompt("Where?", "", callback);
    expect(callback).toHaveBeenCalledWith("file:///");
  });

  it("prompts, null if cancelled", () => {
    /** @type {any} */
    const win = undefined;

    /** @type {any} */
    const Entry = class {
      connect() {
        this.text = "user input";
      }
    };

    /** @type {any} */
    const MessageDialog = class {
      connect() {
        const handleResponse = arguments[arguments.length - 1];

        this.destroy = noop;
        this.show_all = () => handleResponse(undefined, ResponseType.CANCEL);
      }

      get_content_area() {
        return { add: noop };
      }
    };

    const dialogService = new DialogService(win);
    dialogService.Entry = Entry;
    dialogService.MessageDialog = MessageDialog;

    const callback = expect.createSpy();
    dialogService.prompt("Where?", "", callback);
    expect(callback).toHaveBeenCalledWith(null);
  });

  it("prompts, null if closed", () => {
    /** @type {any} */
    const win = undefined;

    /** @type {any} */
    const Entry = class {
      connect() {
        this.text = "user input";
      }
    };

    /** @type {any} */
    const MessageDialog = class {
      connect() {
        const handleResponse = arguments[arguments.length - 1];

        this.destroy = noop;
        this.show_all = () => handleResponse(undefined, "something else");
      }

      get_content_area() {
        return { add: noop };
      }
    };

    const dialogService = new DialogService(win);
    dialogService.Entry = Entry;
    dialogService.MessageDialog = MessageDialog;

    const callback = expect.createSpy();
    dialogService.prompt("Where?", "", callback);
    expect(callback).toHaveBeenCalledWith(null);
  });
});
