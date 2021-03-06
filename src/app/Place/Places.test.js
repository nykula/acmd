const { h } = require("../Gjs/GtkInferno");
const { shallow } = require("../Test/Test");
const { Places } = require("./Places");

describe("Places", () => {
  it("renders without crashing", () => {
    /** @type {any} */
    const placeService = {
      places: [
        {
          icon: "drive-harddisk",
          iconType: "ICON_NAME",
          name: "System",
          rootUri: "file:///media/System",
        },
        {
          icon: "media-optical",
          iconType: "ICON_NAME",
          name: "Music",
          rootUri: "file:///media/Music",
        },
      ],
    };

    shallow(
      h(Places, {
        panelId: 0,
        placeService: placeService,
      }),
    );
  });
});
