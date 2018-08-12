const { noop } = require("lodash");
const { autoBind } = require("../Gjs/autoBind");

class ActionService {
  /**
   * @typedef Action
   * @property {Function} handler
   * @property {string} id
   *
   * @param {{ [key: string]: any }} props
   */
  constructor(props) {
    /**
     * @private
     * @type {Map<string, Action>}
     */
    this.actions = new Map();

    this.print = print;

    /**
     * @private
     */
    this.props = props;

    autoBind(this, ActionService.prototype, __filename);
  }

  /**
   * @param {string} id
   */
  get(id) {
    if (!this.actions.has(id)) {
      const [service, key] = id.split(".");

      const callback =
        this.props[service] && this.props[service][key]
          ? this.props[service][key]
          : noop;

      if (callback === noop) {
        this.print(`Action: Callback ${service}.${key} not found`);
      }

      this.actions.set(id, {
        handler: () => {
          callback();
        },
        id,
      });
    }

    return /** @type {Action} */ (this.actions.get(id));
  }
}

exports.ActionService = ActionService;
