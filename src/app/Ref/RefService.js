const { autoBind } = require("../Gjs/autoBind");

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
   * @deprecated TODO: Private when app-wide types are stronger.
   * @param {string} key
   */
  get(key) {
    return this.refs[key];
  }

  /**
   * @param {string} key
   */
  property(key) {
    return {
      get: () => this.get(key),
      set: this.set(key),
    };
  }

  /**
   * @deprecated TODO: Private when app-wide types are stronger.
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
