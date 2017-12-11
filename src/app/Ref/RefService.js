const { autoBind } = require("../Gjs/autoBind");

/**
 * @deprecated
 */
class RefService {
  constructor() {
    autoBind(this, RefService.prototype, __filename);

    /**
     * @private
     * @type {{ [key: string]: any }}
     */
    this.refs = {};

    /**
     * @private
     * @type {{ [key: string]: ((node: any) => void) }}
     */
    this.setters = {};
  }

  /**
   * @param {string} key
   */
  get(key) {
    return this.refs[key];
  }

  /**
   * @param {string} key
   */
  set(key) {
    if (!this.setters[key]) {
      this.setters[key] = node => {
        this.refs[key] = node;
      };
    }

    return this.setters[key];
  }
}

exports.RefService = RefService;
