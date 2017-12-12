const { PRIORITY_DEFAULT } = imports.gi.GLib;
const expect = require("expect");
const { gioAsync } = require("./gioAsync");

describe("gioAsync", () => {
  it("wraps _async and _finish into node-style callback", () => {
    const { GioFile } = setup();

    const existingDir = new GioFile(true);
    gioAsync(existingDir, "make_directory",
      PRIORITY_DEFAULT,
      null,
      (/** @type {Error} */ error, /** @type {any} */ result) => {
        expect(error.message).toBe("Directory exists.");
        expect(result).toBe(undefined);
      },
    );

    const dir = new GioFile(false);
    gioAsync(dir, "make_directory",
      PRIORITY_DEFAULT,
      null,
      (/** @type {Error} */ error, /** @type {any} */ result) => {
        expect(error).toNotExist();
        expect(result).toBe(true);
      });
  });

  function setup() {
    class AsyncResult {
      constructor() {
        this.type = "ASYNC_RESULT";
      }
    }

    class GioFile {
      /**
       * @param {boolean} exists
       */
      constructor(exists) {
        this.exists = exists;

        /**
         * @param {AsyncResult} asyncResult
         */
        this.make_directory_finish = (asyncResult) => {
          expect(asyncResult.type).toBe("ASYNC_RESULT");

          if (this.exists) {
            throw new Error("Directory exists.");
          } else {
            return true;
          }
        };
      }

      make_directory_async() {
        arguments[arguments.length - 1](null, new AsyncResult());
      }
    }

    return { GioFile: GioFile };
  }
});
