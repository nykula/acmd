const { FileType } = imports.gi.Gio;
const expect = require("expect");
const { File } = require("../../domain/File/File");
const { h } = require("../Gjs/GtkInferno");
const { shallow } = require("../Test/Test");
const { TreeView } = require("../TreeView/TreeView");
const { DirectoryFile } = require("./DirectoryFile");

describe("DirectoryFile", () => {
  it("renders without crashing", () => {
    shallow(
      h(DirectoryFile, {
        file: new File(),
        isSelected: false,
      }),
    );
  });

  it("maps files to table rows", () => {
    /** @type {any} */
    let file;

    /** @type {DirectoryFile} */
    let row;

    file = {
      fileType: FileType.DIRECTORY,
      icon: "go-up",
      iconType: "ICON_NAME",
      modificationTime: 1490397889,
      name: "..",
    };

    row = new DirectoryFile({ file, isSelected: false });
    expect(row.name()).toEqual(["[..]", ""]);
    expect(row.size()).toEqual("<DIR>");

    file = {
      fileType: FileType.DIRECTORY,
      icon: "folder",
      iconType: "ICON_NAME",
      modificationTime: 1490397889,
      name: "Test",
    };

    row = new DirectoryFile({ file, isSelected: false });
    expect(row.name()).toEqual(["[Test]", ""]);
    expect(row.size()).toEqual("<DIR>");

    file = {
      fileType: FileType.REGULAR,
      icon: "some gio icon",
      iconType: "GICON",
      modificationTime: 1490397889,
      name: "foo.bar",
      size: 1000,
    };
    row = new DirectoryFile({ file, isSelected: false });
    expect(row.name()).toEqual(["foo", "bar"]);
    expect(row.size()).toEqual("1 k");
  });

  it("selects matching file as user types", () => {
    /** @type {any[]} */
    const files = [
      {
        fileType: FileType.DIRECTORY,
        modificationTime: 0,
        name: "system32",
      },
      {
        fileType: FileType.REGULAR,
        modificationTime: 0,
        name: "Some File Name.jpeg",
        size: 1048576,
      },
    ];

    const rows = files.map(file => new DirectoryFile({
      file,
      isSelected: false,
    }));

    const store = {
      /**
       * @param {string} x
       */
      get_string_from_iter: x => x,
    };

    const treeView = {
      _cursor: 1,
      body: { children: rows },
      store,
    };

    /**
     * @type {(store: any, _: any, input: string, iter: any) => boolean}
     */
    const shouldSearchSkip = TreeView.prototype.shouldSearchSkip.bind(treeView);

    let skip;

    skip = shouldSearchSkip(store, null, "syst", 0);
    expect(skip).toBe(false);
    skip = shouldSearchSkip(store, null, "systt", 0);
    expect(skip).toBe(true);

    skip = shouldSearchSkip(store, null, "some fi", 1);
    expect(skip).toBe(false);
    skip = shouldSearchSkip(store, null, "some fir", 1);
    expect(skip).toBe(false); // Because cursor.
  });

  it("selects matching file as user types, with glob support", () => {
    const file = new File();
    file.name = "foo.bar";

    const dirFile = new DirectoryFile({
      file,
      isSelected: false,
    });

    expect(dirFile.shouldSearchSkip("*.bar")).toBe(false);
    expect(dirFile.shouldSearchSkip("*.js")).toBe(true);
  });
});
