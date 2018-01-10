const GLib = imports.gi.GLib;
const { File } = imports.gi.Gio;

/**
 * URIs in copy prompt.
 */
class UriService {
  /**
   * Normalizes a URI edited by user.
   *
   * @param {string} userInput
   */
  normalize(userInput) {
    const file =
      userInput[0] === "/"
        ? File.new_for_path(userInput)
        : File.new_for_uri(userInput);

    let uri = file.get_uri();

    if (
      userInput[userInput.length - 1] === "/" &&
      uri[uri.length - 1] !== "/"
    ) {
      uri += "/";
    }

    return uri;
  }

  /**
   * Unescapes a URI so user can edit.
   *
   * @param {string} gioOutput
   */
  unescape(gioOutput) {
    return GLib.uri_unescape_string(gioOutput, null).replace(/^file:\/\//, "");
  }
}

exports.UriService = UriService;
