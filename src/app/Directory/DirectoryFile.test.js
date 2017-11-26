const { FileType } = imports.gi.Gio;
const expect = require("expect");
const h = require("inferno-hyperscript").default;
const { DirectoryFile } = require("./DirectoryFile");
const { shallow } = require("../Test/Test");
const { TreeView } = require("../TreeView/TreeView");

describe("DirectoryFile", () => {
  it("renders without crashing", () => {
    const file = {
      fileType: FileType.REGULAR,
      icon: "some gio icon",
      iconType: "GICON",
      modificationTime: 1490397889,
      name: "foo.bar",
      size: 1000,
    };

    shallow(
      h(DirectoryFile, {
        file,
        isSelected: false,
      }),
    );
  });

  it("maps files to table rows", () => {
    /** @type {*} */
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
        name: "Some File Name.jpeg",
        modificationTime: 0,
        size: 1048576,
      },
    ];

    const rows = files.map(file => new DirectoryFile({
      file,
      isSelected: false,
    }));

    const store = {
      get_string_from_iter: x => x,
    };

    const treeView = {
      body: { children: rows },
      _cursor: 1,
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
});
