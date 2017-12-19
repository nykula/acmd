const { PRIORITY_DEFAULT } = imports.gi.GLib;
const expect = require("expect");
const { GioAsync } = require("./GioAsync");

describe("GioAsync", () => {
  it("wraps _async and _finish into node-style callback", () => {
    const { GioFile } = setup();

    const existingDir = new GioFile(true);

    GioAsync(
      readyCallback => existingDir.make_directory_async(
        PRIORITY_DEFAULT,
        null,
        readyCallback,
      ),

      result => existingDir.make_directory_finish(result),

      (error, result) => {
        expect(error.message).toBe("Directory exists.");
        expect(result).toBe(undefined);
      },
    );

    const dir = new GioFile(false);

    GioAsync(
      readyCallback => dir.make_directory_async(
        PRIORITY_DEFAULT,
        null,
        readyCallback,
      ),

      result => dir.make_directory_finish(result),

      (error, result) => {
        expect(error).toNotExist();
        expect(result).toBe(true);
      });
  });

  function setup() {
    class GioFile {
      /**
       * @param {boolean} exists
       */
      constructor(exists) {
        this.exists = exists;

        /**
         * @param {any} _
         */
        this.make_directory_finish = (_) => {
          if (this.exists) {
            throw new Error("Directory exists.");
          } else {
            return true;
          }
        };
      }

      make_directory_async() {
        arguments[arguments.length - 1](null, {});
      }
    }

    return { GioFile: GioFile };
  }
});
