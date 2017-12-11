const expect = require("expect");
const { toJS } = require("mobx");
const { Class, EmptyArray, EmptyProps, NoString } = require("../Test/Test");
const { PlaceService } = require("./PlaceService");

describe("PlaceService", () => {
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

    const placeService = new PlaceService(EmptyProps);
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
    const VolumeMonitor = {
      get: () => ({
        get_connected_drives: () => EmptyArray,
        get_mounts: () => EmptyArray,
      }),
    };

    const placeService = new PlaceService(EmptyProps);
    placeService.File = File;
    placeService.VolumeMonitor = VolumeMonitor;
    placeService.refresh();

    expect(toJS(placeService.names)).toEqual(["/"]);

    expect(toJS(placeService.entities["/"])).toEqual({
      filesystemFree: 1024,
      filesystemSize: 1024,
      icon: "computer",
      iconType: "ICON_NAME",
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
        }),
      }),
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

    const placeService = new PlaceService(EmptyProps);
    placeService.File = File;
    placeService.VolumeMonitor = VolumeMonitor;
    placeService.refresh();

    expect(toJS(placeService.names)).toEqual(["/", "random-uuid"]);

    expect(toJS(placeService.entities["/"])).toEqual({
      filesystemFree: 1024,
      filesystemSize: 1024,
      icon: "computer",
      iconType: "ICON_NAME",
      name: "/",
      rootUri: "file:///",
      uuid: null,
    });

    expect(toJS(placeService.entities["random-uuid"])).toEqual({
      filesystemFree: 0,
      filesystemSize: 0,
      icon: "drive-harddisk",
      iconType: "ICON_NAME",
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
            }),
          }),
        }],
      }),
    };

    const placeService = new PlaceService(EmptyProps);
    placeService.File = File;
    placeService.VolumeMonitor = VolumeMonitor;
    placeService.refresh();

    expect(toJS(placeService.names)).toEqual(["/", "System"]);

    expect(toJS(placeService.entities["/"])).toEqual({
      filesystemFree: 1024,
      filesystemSize: 1024,
      icon: "computer",
      iconType: "ICON_NAME",
      name: "/",
      rootUri: "file:///",
      uuid: null,
    });

    expect(toJS(placeService.entities.System)).toEqual({
      filesystemFree: 23423,
      filesystemSize: 23423,
      icon: ". GThemedIcon drive-harddisk-usb drive-harddisk drive",
      iconType: "GICON",
      name: "System",
      rootUri: "file:///media/System",
      uuid: null,
    });
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
    const VolumeMonitor = {
      get: () => ({
        get_connected_drives: () => EmptyArray,
        get_mounts: () => [{
          get_icon: () => ({
            to_string: () => ". GThemedIcon folder-remote folder",
          }),
          get_name: () => "foo on bar.example.com",
          get_root: () => ({
            get_uri: () => "sftp:///foo@bar.example.com/",
            query_filesystem_info_async: function() {
              arguments[arguments.length - 1]();
            },

            query_filesystem_info_finish: () => ({
              get_attribute_as_string: () => false,
            }),
          }),
        }],
      }),
    };

    const placeService = new PlaceService(EmptyProps);
    placeService.File = File;
    placeService.VolumeMonitor = VolumeMonitor;
    placeService.refresh();

    expect(placeService.entities["/"]).toEqual({
      filesystemFree: 1024,
      filesystemSize: 1024,
      icon: "computer",
      iconType: "ICON_NAME",
      name: "/",
      rootUri: "file:///",
      uuid: null,
    });

    expect(placeService.entities["foo on bar.example.com"]).toEqual({
      filesystemFree: 0,
      filesystemSize: 0,
      icon: ". GThemedIcon folder-remote folder",
      iconType: "GICON",
      name: "foo on bar.example.com",
      rootUri: "sftp:///foo@bar.example.com/",
      uuid: null,
    });
  });

  it("saves places, ordered by name", () => {
    const placeService = new PlaceService(EmptyProps);

    placeService.set([
      {
        filesystemFree: 0,
        filesystemSize: 0,
        icon: "computer",
        iconType: "ICON_NAME",
        name: "/",
        rootUri: "file:///",
        uuid: NoString,
      },
      {
        filesystemFree: 0,
        filesystemSize: 0,
        icon: "drive-harddisk",
        iconType: "ICON_NAME",
        name: "abc",
        rootUri: NoString,
        uuid: NoString,
      },
      {
        filesystemFree: 0,
        filesystemSize: 0,
        icon: "drive-harddisk",
        iconType: "ICON_NAME",
        name: "System",
        rootUri: "file:///media/System",
        uuid: NoString,
      },
    ]);

    expect(toJS(placeService.names)).toEqual(["/", "System", "abc"]);

    expect(toJS(placeService.entities)).toEqual({
      "/": {
        filesystemFree: 0,
        filesystemSize: 0,
        icon: "computer",
        iconType: "ICON_NAME",
        name: "/",
        rootUri: "file:///",
        uuid: null,
      },
      System: {
        filesystemFree: 0,
        filesystemSize: 0,
        icon: "drive-harddisk",
        iconType: "ICON_NAME",
        name: "System",
        rootUri: "file:///media/System",
        uuid: null,
      },
      abc: {
        filesystemFree: 0,
        filesystemSize: 0,
        icon: "drive-harddisk",
        iconType: "ICON_NAME",
        name: "abc",
        rootUri: null,
        uuid: null,
      },
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

    const placeService = new PlaceService(EmptyProps);
    placeService.File = File;

    const callback = expect.createSpy();
    placeService.unmount("file:///media/Test", callback);
    expect(callback).toHaveBeenCalled();
  });
});
