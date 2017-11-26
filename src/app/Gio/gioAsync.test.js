const { PRIORITY_DEFAULT } = imports.gi.GLib;
const expect = require("expect");
const gioAsync = require("./gioAsync").default;

describe("gioAsync", () => {
  it("wraps _async and _finish into node-style callback", () => {
    const { GioFile } = setup();

    const existingDir = new GioFile(true);
    gioAsync(existingDir, "make_directory",
      PRIORITY_DEFAULT,
      null,
      (error, result) => {
        expect(error.message).toBe("Directory exists.");
        expect(result).toNotExist();
      },
    );

    const dir = new GioFile(false);
    gioAsync(dir, "make_directory",
      PRIORITY_DEFAULT,
      null,
      (error, result) => {
        expect(error).toNotExist();
        expect(result).toBe(true);
      });
  });

  function setup() {
    function AsyncResult() {
      this.type = "ASYNC_RESULT";
    }

    function GioFile(exists) {
      this.make_directory_async = this.make_directory_async.bind(this);
      this.make_directory_finish = this.make_directory_finish.bind(this);
      this.exists = exists;
    }

    GioFile.prototype.make_directory_async = function(_priority, _cancellable, callback) {
      callback(null, new AsyncResult());
    };

    GioFile.prototype.make_directory_finish = function(asyncResult) {
      expect(asyncResult.type).toBe("ASYNC_RESULT");

      if (this.exists) {
        throw new Error("Directory exists.");
      } else {
        return true;
      }
    };

    return { GioFile: GioFile };
  }
});
