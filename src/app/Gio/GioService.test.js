const expect = require("expect");
const { GioService } = require("./GioService");

describe("GioService", () => {
  it("gets places, including root", () => {
    const gVolMon = {
      get_connected_drives: () => [],
      get_mounts: () => [],
    };

    const Gio = {
      File: {
        new_for_uri: () => ({
          query_filesystem_info_async: function() {
            arguments[arguments.length - 1]();
          },

          query_filesystem_info_finish: () => ({
            get_attribute_as_string: () => "1024",
          }),
        }),
      },
      VolumeMonitor: {
        get: () => gVolMon,
      },
    };

    const callback = expect.createSpy().andReturn(undefined);
    const gioService = new GioService(Gio, undefined);
    gioService.getPlaces(callback);

    expect(callback).toHaveBeenCalledWith(null, [{
      filesystemFree: 1024,
      filesystemSize: 1024,
      icon: "computer",
      iconType: "ICON_NAME",
      name: "/",
      rootUri: "file:///",
      uuid: null,
    }]);
  });

  it("gets places, including unmounted volume", () => {
    const gVolMon = {
      get_connected_drives: () => [{
        get_volumes: () => [{
          get_identifier: () => "random-uuid",
          get_mount: () => null,
        }],
      }],

      get_mounts: () => [],
    };

    const Gio = {
      File: {
        new_for_uri: () => ({
          query_filesystem_info_async: function() {
            arguments[arguments.length - 1]();
          },

          query_filesystem_info_finish: () => ({
            get_attribute_as_string: () => "1024",
          }),
        }),
      },
      VolumeMonitor: {
        get: () => gVolMon,
      },
    };

    const callback = expect.createSpy().andReturn(undefined);
    const gioService = new GioService(Gio, undefined);
    gioService.getPlaces(callback);

    expect(callback).toHaveBeenCalledWith(null, [
      {
        filesystemFree: 1024,
        filesystemSize: 1024,
        icon: "computer",
        iconType: "ICON_NAME",
        name: "/",
        rootUri: "file:///",
        uuid: null,
      },
      {
        filesystemFree: 0,
        filesystemSize: 0,
        icon: "drive-harddisk",
        iconType: "ICON_NAME",
        name: "random-uuid",
        rootUri: null,
        uuid: "random-uuid",
      },
    ]);
  });

  it("gets places, including mounted volume", () => {
    const gVolMon = {
      get_connected_drives: () => [{
        get_volumes: () => [{
          get_identifier: () => null,
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
    };

    const Gio = {
      File: {
        new_for_uri: () => ({
          query_filesystem_info_async: function() {
            arguments[arguments.length - 1]();
          },

          query_filesystem_info_finish: () => ({
            get_attribute_as_string: () => "1024",
          }),
        }),
      },
      VolumeMonitor: {
        get: () => gVolMon,
      },
    };

    const callback = expect.createSpy().andReturn(undefined);
    const gioService = new GioService(Gio, undefined);
    gioService.getPlaces(callback);

    expect(callback).toHaveBeenCalledWith(null, [
      {
        filesystemFree: 1024,
        filesystemSize: 1024,
        icon: "computer",
        iconType: "ICON_NAME",
        name: "/",
        rootUri: "file:///",
        uuid: null,
      },
      {
        filesystemFree: 23423,
        filesystemSize: 23423,
        icon: ". GThemedIcon drive-harddisk-usb drive-harddisk drive",
        iconType: "GICON",
        name: "System",
        rootUri: "file:///media/System",
        uuid: null,
      },
    ]);
  });

  it("gets places, including remote mount", () => {
    const gVolMon = {
      get_connected_drives: () => [],
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
            get_attribute_as_string: () => null,
          }),
        }),
      }],
    };

    const Gio = {
      File: {
        new_for_uri: () => ({
          query_filesystem_info_async: function() {
            arguments[arguments.length - 1]();
          },

          query_filesystem_info_finish: () => ({
            get_attribute_as_string: () => "1024",
          }),
        }),
      },
      VolumeMonitor: {
        get: () => gVolMon,
      },
    };

    const callback = expect.createSpy().andReturn(undefined);
    const gioService = new GioService(Gio, undefined);
    gioService.getPlaces(callback);

    expect(callback).toHaveBeenCalledWith(null, [
      {
        filesystemFree: 1024,
        filesystemSize: 1024,
        name: "/",
        icon: "computer",
        iconType: "ICON_NAME",
        rootUri: "file:///",
        uuid: null,
      },
      {
        filesystemFree: 0,
        filesystemSize: 0,
        name: "foo on bar.example.com",
        icon: ". GThemedIcon folder-remote folder",
        iconType: "GICON",
        rootUri: "sftp:///foo@bar.example.com/",
        uuid: null,
      },
    ]);
  });

  it("gets handlers", () => {
    const AppInfo = {
      get_all_for_type: () => [
        {
          get_commandline: () => "/usr/share/code/code --unity-launch %U",
          get_display_name: () => "Visual Studio Code",
          get_icon: () => ({
            to_string: () => "code",
          }),
        },
        {
          get_commandline: () => "/usr/bin/gedit %U",
          get_display_name: () => "Text Editor",
          get_icon: () => ({
            to_string: () => "gedit",
          }),
        },
        {
          get_commandline: () => "/usr/bin/foobar %U",
          get_display_name: () => "Foobar",
          get_icon: () => null,
        },
        {
          get_commandline: () => "/usr/bin/gedit %U",
          get_display_name: () => "Text Editor",
          get_icon: () => ({
            to_string: () => "gedit",
          }),
        },
      ],
      get_default_for_type: () => ({
        get_commandline: () => "/usr/bin/gedit %U",
        get_display_name: () => "Text Editor",
        get_icon: () => ({
          to_string: () => "gedit",
        }),
      }),
    };

    const Gio = {
      AppInfo,

      file_new_for_uri: () => ({
        query_info_async: function() {
          arguments[arguments.length - 1]();
        },

        query_info_finish: () => ({
          get_content_type: () => "text/plain",
        }),
      }),
    };

    const callback = expect.createSpy();

    const gioService = new GioService(Gio, undefined);

    gioService.getHandlers("file:///foo.bar", callback);

    expect(callback).toHaveBeenCalledWith(null, {
      contentType: "text/plain",
      handlers: [
        {
          commandline: "/usr/bin/gedit %U",
          displayName: "Text Editor",
          icon: "gedit",
        },
        {
          commandline: "/usr/share/code/code --unity-launch %U",
          displayName: "Visual Studio Code",
          icon: "code",
        },
        {
          commandline: "/usr/bin/foobar %U",
          displayName: "Foobar",
          icon: null,
        },
      ],
    });
  });
});
