const expect = require("expect");
const { GioService } = require("./GioService");

describe("GioService", () => {
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
          get_icon: () => false,
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

    /** @type {any} */
    const Gio = {
      AppInfo,

      File: {
        new_for_uri: () => ({
          query_info_async: function() {
            arguments[arguments.length - 1]();
          },

          query_info_finish: () => ({
            get_content_type: () => "text/plain",
          }),
        }),
      },
    };

    const callback = expect.createSpy();

    const gioService = new GioService(Gio);

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
