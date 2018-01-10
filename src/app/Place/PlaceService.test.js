const expect = require("expect");
const { toJS } = require("mobx");
const { RefService } = require("../Ref/RefService");
const { Class, EmptyArray, NoString } = require("../Test/Test");
const { PlaceService } = require("./PlaceService");

describe("PlaceService", () => {
  it("shortens string", () => {
    const xs = ["foo", "bar", "baz", "qux"];
    expect(PlaceService.minLength(xs, "foo")).toBe("f");
    expect(PlaceService.minLength(xs, "bar")).toBe("bar");
    expect(PlaceService.minLength(xs, "baz")).toBe("baz");
    expect(PlaceService.minLength(xs, "qux")).toBe("q");
  });

  it("mounts uuid", () => {
    /** @type {any} */
    const MountOperation = Class;

    /** @type {any} */
    const VolumeMonitor = {
      get: () => ({
        get_volumes: () => [{
          get_identifier: () => "random-uuid",
          mount: function() {
            arguments[arguments.length - 1]();
          },
        }],
      }),
    };

    const refService = new RefService();
    const placeService = new PlaceService({ refService });
    placeService.MountOperation = MountOperation;
    placeService.VolumeMonitor = VolumeMonitor;

    const callback = expect.createSpy();
    placeService.mountUuid("random-uuid", callback);
    expect(callback).toHaveBeenCalled();
  });

  it("refreshes, including root", () => {
    /** @type {any} */
    const File = {
      new_for_uri: () => ({
        query_filesystem_info_async: function() {
          arguments[arguments.length - 1]();
        },

        query_filesystem_info_finish: () => ({
          get_attribute_as_string: () => "1024",
        }),
      }),
    };

    /** @type {any} */
    const GLib = {
      UserDirectory: { N_DIRECTORIES: 0 },
      get_home_dir: () => false,
    };

    /** @type {any} */
    const VolumeMonitor = {
      get: () => ({
        get_connected_drives: () => EmptyArray,
        get_mounts: () => EmptyArray,
      }),
    };

    const refService = new RefService();
    const placeService = new PlaceService({ refService });
    placeService.File = File;
    placeService.GLib = GLib;
    placeService.VolumeMonitor = VolumeMonitor;
    placeService.refresh();

    expect(toJS(placeService.root)).toEqual({
      canUnmount: false,
      filesystemFree: 1024,
      filesystemSize: 1024,
      icon: "computer",
      iconType: "ICON_NAME",
      isShadowed: false,
      name: "/",
      rootUri: "file:///",
      uuid: null,
    });
  });

  it("refreshes, including unmounted volume", () => {
    /** @type {any} */
    const File = {
      new_for_uri: () => ({
        query_filesystem_info_async: function() {
          arguments[arguments.length - 1]();
        },

        query_filesystem_info_finish: () => ({
          get_attribute_as_string: () => "1024",
          get_attribute_boolean: () => false,
        }),
      }),
    };

    /** @type {any} */
    const GLib = {
      UserDirectory: { N_DIRECTORIES: 0 },
      get_home_dir: () => false,
    };

    /** @type {any} */
    const VolumeMonitor = {
      get: () => ({
        get_connected_drives: () => [{
          get_volumes: () => [{
            get_identifier: () => "random-uuid",
            get_mount: () => false,
          }],
        }],

        get_mounts: () => EmptyArray,
      }),
    };

    const refService = new RefService();
    const placeService = new PlaceService({ refService });
    placeService.File = File;
    placeService.GLib = GLib;
    placeService.VolumeMonitor = VolumeMonitor;
    placeService.refresh();

    expect(toJS(placeService.root)).toEqual({
      canUnmount: false,
      filesystemFree: 1024,
      filesystemSize: 1024,
      icon: "computer",
      iconType: "ICON_NAME",
      isShadowed: false,
      name: "/",
      rootUri: "file:///",
      uuid: null,
    });

    expect(toJS(placeService.drives.find(x => x.name === "random-uuid"))).toEqual({
      canUnmount: false,
      filesystemFree: 0,
      filesystemSize: 0,
      icon: "drive-harddisk",
      iconType: "ICON_NAME",
      isShadowed: false,
      name: "random-uuid",
      rootUri: null,
      uuid: "random-uuid",
    });
  });

  it("refreshes, including mounted volume", () => {
    /** @type {any} */
    const File = {
      new_for_uri: () => ({
        query_filesystem_info_async: function() {
          arguments[arguments.length - 1]();
        },

        query_filesystem_info_finish: () => ({
          get_attribute_as_string: () => "1024",
        }),
      }),
    };

    /** @type {any} */
    const GLib = {
      UserDirectory: { N_DIRECTORIES: 0 },
      get_home_dir: () => false,
    };

    /** @type {any} */
    const VolumeMonitor = {
      get: () => ({
        get_connected_drives: () => [{
          get_volumes: () => [{
            get_identifier: () => false,
            get_mount: () => ({
              get_icon: () => ({
                to_string: () => ". GThemedIcon drive-harddisk-usb drive-harddisk drive",
              }),
              get_name: () => "System",
              get_root: () => ({
                get_uri: () => "file:///media/System",
                query_filesystem_info_async: function() {
                  arguments[arguments.length - 1]();
                },

                query_filesystem_info_finish: () => ({
                  get_attribute_as_string: () => "23423",
                }),
              }),
            }),
          }],
        }],

        get_mounts: () => [{
          get_icon: () => ({
            to_string: () => ". GThemedIcon drive-harddisk-usb drive-harddisk drive",
          }),
          get_name: () => "System",
          get_root: () => ({
            get_uri: () => "file:///media/System",
            query_filesystem_info_async: function() {
              arguments[arguments.length - 1]();
            },

            query_filesystem_info_finish: () => ({
              get_attribute_as_string: () => "23423",
              get_attribute_boolean: () => false,
              get_icon: () => ({
                to_string: () => ". GThemedIcon drive-harddisk-usb drive-harddisk drive",
              }),
            }),
          }),
          get_uuid: () => "random-uuid",
          is_shadowed: () => false,
        }],
      }),
    };

    const refService = new RefService();
    const placeService = new PlaceService({ refService });
    placeService.File = File;
    placeService.GLib = GLib;
    placeService.VolumeMonitor = VolumeMonitor;
    placeService.refresh();

    expect(toJS(placeService.root)).toEqual({
      canUnmount: false,
      filesystemFree: 1024,
      filesystemSize: 1024,
      icon: "computer",
      iconType: "ICON_NAME",
      isShadowed: false,
      name: "/",
      rootUri: "file:///",
      uuid: null,
    });

    expect(toJS(placeService.mounts.find(x => x.name === "System"))).toEqual({
      canUnmount: false,
      filesystemFree: 23423,
      filesystemSize: 23423,
      icon: ". GThemedIcon drive-harddisk-usb drive-harddisk drive",
      iconType: "GICON",
      isShadowed: false,
      name: "System",
      rootUri: "file:///media/System",
      uuid: "random-uuid",
    });
  });

  it("refreshes, skipping shadowed mount", () => {
    /** @type {any} */
    const File = {
      new_for_uri: () => ({
        query_filesystem_info_async: function() {
          arguments[arguments.length - 1]();
        },

        query_filesystem_info_finish: () => ({
          get_attribute_as_string: () => "1024",
        }),
      }),
    };

    /** @type {any} */
    const GLib = {
      UserDirectory: { N_DIRECTORIES: 0 },
      get_home_dir: () => false,
    };

    /** @type {any} */
    const VolumeMonitor = {
      get: () => ({
        get_connected_drives: () => EmptyArray,

        get_mounts: () => [
          {
            get_icon: () => ({
              to_string: () => ". GThemedIcon multimedia-player multimedia",
            }),
            get_name: () => "mtp",
            get_root: () => ({
              get_uri: () => "mtp://[usb:001,043]/",
              query_filesystem_info_async: function() {
                arguments[arguments.length - 1]();
              },

              query_filesystem_info_finish: () => ({
                get_attribute_as_string: () => "1024",
                get_attribute_boolean: () => false,
                get_icon: () => ({
                  to_string: () => ". GThemedIcon multimedia-player multimedia",
                }),
              }),
            }),
            get_uuid: () => "random-uuid",
            is_shadowed: () => true,
          },

          {
            get_icon: () => ({
              to_string: () => ". GThemedIcon multimedia-player multimedia",
            }),
            get_name: () => "MT65xx Android Phone",
            get_root: () => ({
              get_uri: () => "mtp://[usb:001,043]/",
              query_filesystem_info_async: function() {
                arguments[arguments.length - 1]();
              },

              query_filesystem_info_finish: () => ({
                get_attribute_as_string: () => "1024",
                get_attribute_boolean: () => false,
                get_icon: () => ({
                  to_string: () => ". GThemedIcon multimedia-player multimedia",
                }),
              }),
            }),
            get_uuid: () => "random-uuid",
            is_shadowed: () => false,
          },
        ],
      }),
    };

    const refService = new RefService();
    const placeService = new PlaceService({ refService });
    placeService.File = File;
    placeService.GLib = GLib;
    placeService.VolumeMonitor = VolumeMonitor;
    placeService.refresh();

    expect(
      toJS(
        placeService.places.filter(x => x.rootUri === "mtp://[usb:001,043]/"),
      ),
    ).toEqual([
      {
        canUnmount: false,
        filesystemFree: 1024,
        filesystemSize: 1024,
        icon: ". GThemedIcon multimedia-player multimedia",
        iconType: "GICON",
        isShadowed: false,
        name: "MT65xx Android Phone",
        rootUri: "mtp://[usb:001,043]/",
        uuid: "random-uuid",
      },
    ]);
  });

  it("refreshes, including remote mount", () => {
    /** @type {any} */
    const File = {
      new_for_uri: () => ({
        query_filesystem_info_async: function() {
          arguments[arguments.length - 1]();
        },

        query_filesystem_info_finish: () => ({
          get_attribute_as_string: () => "1024",
        }),
      }),
    };

    /** @type {any} */
    const GLib = {
      UserDirectory: { N_DIRECTORIES: 0 },
      get_home_dir: () => false,
    };

    /** @type {any} */
    const VolumeMonitor = {
      get: () => ({
        get_connected_drives: () => EmptyArray,
        get_mounts: () => [{
          get_name: () => "foo on bar.example.com",
          get_root: () => ({
            get_uri: () => "sftp:///foo@bar.example.com/",
            query_filesystem_info_async: function() {
              arguments[arguments.length - 1]();
            },

            query_filesystem_info_finish: () => ({
              get_attribute_as_string: () => false,
              get_attribute_boolean: () => false,
              get_icon: () => ({
                to_string: () => ". GThemedIcon folder-remote folder",
              }),
            }),
          }),
          get_uuid: () => "random-uuid",
          is_shadowed: () => false,
        }],
      }),
    };

    const refService = new RefService();
    const placeService = new PlaceService({ refService });
    placeService.File = File;
    placeService.GLib = GLib;
    placeService.VolumeMonitor = VolumeMonitor;
    placeService.refresh();

    expect(placeService.root).toEqual({
      canUnmount: false,
      filesystemFree: 1024,
      filesystemSize: 1024,
      icon: "computer",
      iconType: "ICON_NAME",
      isShadowed: false,
      name: "/",
      rootUri: "file:///",
      uuid: null,
    });

    expect(placeService.mounts.find(x => x.name === "foo on bar.example.com")).toEqual({
      canUnmount: false,
      filesystemFree: 0,
      filesystemSize: 0,
      icon: ". GThemedIcon folder-remote folder",
      iconType: "GICON",
      isShadowed: false,
      name: "foo on bar.example.com",
      rootUri: "sftp:///foo@bar.example.com/",
      uuid: "random-uuid",
    });
  });

  it("unmounts", () => {
    /** @type {any} */
    const File = {
      new_for_uri: () => ({
        find_enclosing_mount: () => ({
          unmount: function() {
            arguments[arguments.length - 1]();
          },
        }),
      }),
    };

    const refService = new RefService();
    const placeService = new PlaceService({ refService });
    placeService.File = File;

    const callback = expect.createSpy();
    placeService.unmount("file:///media/Test", callback);
    expect(callback).toHaveBeenCalled();
  });
});
