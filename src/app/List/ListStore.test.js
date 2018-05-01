const { Icon } = imports.gi.Gio;
const { TreeViewColumn } = imports.gi.Gtk;
const expect = require("expect");
const { render } = require("inferno");
const { h } = require("../Gjs/GtkInferno");
const { Stub } = require("../Gjs/Stub");
const { ListStore } = require("./ListStore");

describe("ListStore", () => {
  it("renders", () => {
    const instance = new ListStore({
      cols: [
        { name: "selected", type: Boolean },
        { name: "icon", type: Icon },
        { name: "name" },
      ],
    });

    /** @type {any} */
    const store = {
      children: [],
      parentNode: { model: undefined },
      set_column_types: expect.createSpy(),
    };

    instance.ref(store);
    instance.componentDidMount();

    expect(store.set_column_types).toHaveBeenCalledWith([
      Boolean,
      Icon,
      String,
    ]);

    expect(store.parentNode.model).toBe(store);
  });

  it("lets inferno reorder rows", () => {
    /** @type {any} */
    const win = new Stub();

    const cols = [
      { name: "selected", type: Boolean },
      { name: "icon", type: Icon },
      { name: "name" },
    ];

    const levelUp = h("stub", {
      icon: {
        icon: "go-up",
        iconType: "ICON_NAME",
      },
      key: "..",
      name: "..",
      selected: false,
    });

    const documents = h("stub", {
      icon: {
        icon: "folder",
        iconType: "ICON_NAME",
      },
      key: "Documents",
      name: "Documents",
      selected: true,
    });

    render(
      h(ListStore, { cols }, [
        levelUp,
        documents,
      ]),

      win,
    );

    render(
      h(ListStore, { cols }, [
        documents,
        levelUp,
      ]),

      win,
    );

    render(
      h(ListStore, { cols }, [
        documents,
        // levelUp removed
      ]),

      win,
    );

    const weirdDocuments = h("stub", {
      icon: false,
      key: "Documents",
      name: false,
      selected: false,
    });

    render(
      h(ListStore, { cols }, [
        weirdDocuments,
      ]),

      win,
    );
  });

  it("delays render during a major change until all rows added", () => {
    /** @type {any} */
    const win = new Stub();

    const cols = [{ name: "name" }];

    render(
      h(ListStore, { cols }),
      win,
    );

    render(
      h(ListStore, { cols }, [
        h("stub", { key: "foo", name: "foo" }),
        h("stub", { key: "bar", name: "bar" }),
        h("stub", { key: "baz", name: "baz" }),
        h("stub", { key: "qux", name: "qux" }),
      ]),

      win,
    );

    render(
      h(ListStore, { cols }, [
        h("stub", { key: "..", name: ".." }),
        h("stub", { key: "bin", name: "bin" }),
        h("stub", { key: "etc", name: "etc" }),
        h("stub", { key: "lib", name: "lib" }),
        h("stub", { key: "media", name: "media" }),
        h("stub", { key: "root", name: "root" }),
        h("stub", { key: "usr", name: "usr" }),
        h("stub", { key: "var", name: "var" }),
      ]),

      win,
    );
  });

  it("binds view to column", () => {
    const cols = [
      { name: "selected", on_toggled: expect.createSpy(), type: Boolean },
      { name: "icon", type: Icon },
      { name: "name", pack: "pack_end" },
    ];

    const tvCol = new TreeViewColumn();

    for (let i = 0 ; i < cols.length; i++) {
      ListStore.bindView(tvCol, cols[i], i);
    }
  });

  it("refs null", () => {
    new ListStore({ cols: [] }).ref(null);
  });
});
