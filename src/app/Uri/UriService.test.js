const expect = require("expect");
const { UriService } = require("./UriService");

describe("UriService", () => {
  it("normalizes user input to match what gio outputs", () => {
    const { normalize } = new UriService();

    const userInput = "mtp://[usb:001,043]/Phone storage";
    expect(normalize(userInput)).toBe("mtp://%5Busb%3A001,043%5D/Phone%20storage");
  });

  it("normalizes, keeping trailing slash", () => {
    const { normalize } = new UriService();

    const userInput = "mtp://[usb:001,043]/SDcard/";
    expect(normalize(userInput)).toBe("mtp://%5Busb%3A001,043%5D/SDcard/");
  });

  it("normalizes, adding file:// prefix", () => {
    const { normalize } = new UriService();

    const gioOutput = "/c/Program Files";
    expect(normalize(gioOutput)).toBe("file:///c/Program%20Files");
  });

  it("unescapes gio output so user can edit", () => {
    const { unescape } = new UriService();

    const gioOutput = "mtp://%5Busb%3A001,043%5D/";
    expect(unescape(gioOutput)).toBe("mtp://[usb:001,043]/");
  });

  it("unescapes, removing file:// prefix", () => {
    const { unescape } = new UriService();

    const gioOutput = "file:///c/Program%20Files";
    expect(unescape(gioOutput)).toBe("/c/Program Files");
  });
});
