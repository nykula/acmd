const NativeFile = imports.gi.Gio.File;
const {
  action,
  computed,
  extendObservable,
  observable,
  runInAction,
} = require("mobx");
const Nullthrows = require("nullthrows").default;
const { File } = require("../../domain/File/File");
const { Panel } = require("../../domain/Panel/Panel");
const { Place } = require("../../domain/Place/Place");
const { DialogService } = require("../Dialog/DialogService");
const { autoBind } = require("../Gjs/autoBind");
const { PlaceService } = require("../Place/PlaceService");
const { TabService } = require("../Tab/TabService");

/**
 * Tabs of directory panels.
 */
class PanelService {
  /**
   * @typedef IProps
   * @property {DialogService?} [dialogService]
   * @property {PlaceService?} [placeService]
   * @property {TabService?} [tabService]
   *
   * @param {IProps} props
   */
  constructor(props) {
    /**
     * @type {number}
     */
    this.activeId = 0;

    /**
     * @type {{ [id: string]: Panel }}
     */
    this.entities = {
      "0": {
        activeTabId: 0,
        history: ["file:///"],
        now: 0,
        tabIds: [0],
      },
      "1": {
        activeTabId: 1,
        history: ["file:///"],
        now: 0,
        tabIds: [1],
      },
    };

    this.props = props;

    autoBind(this, PanelService.prototype, __filename);

    extendObservable(this, {
      activeId: this.activeId,
      createTab: action(this.createTab),
      cursor: action(this.cursor),
      entities: this.entities,
      nextTab: action(this.nextTab),
      prevTab: action(this.prevTab),
      pushLocation: action(this.pushLocation),
      removeTab: action(this.removeTab),
      selected: action(this.selected),
      setActive: action(this.setActive),
      setActiveTab: action(this.setActiveTab),
      toggleActive: action(this.toggleActive),
    });
  }

  /**
   * Opens previous location in active panel history.
   */
  back() {
    const tabId = this.getActiveTabId();
    this.go(tabId, -1);
  }

  /**
   * Creates tab in active panel.
   */
  createTab() {
    const tabService =
      /** @type {TabService} */ (this.props.tabService);

    const tabId = this.getNextTabId();
    const panel = this.entities[this.activeId];
    const { files, cursor, location, sortedBy } = this.getActiveTab();

    const entities = {};
    entities[tabId] = {
      cursor,
      files: observable.shallowArray(files.slice()),
      location,
      selected: [],
      sortedBy,
    };
    extendObservable(tabService.entities, entities);

    const visibleFiles = {};
    visibleFiles[tabId] = computed(
      tabService.getVisibleFiles.bind(tabService, tabId),
    );
    extendObservable(tabService.visibleFiles, visibleFiles);

    panel.tabIds.push(tabId);
    panel.activeTabId = tabId;
  }

  /**
   * @param {number} panelId
   * @param {number} index
   */
  cursor(panelId, index) {
    this.setActive(panelId);
    this.getActiveTab().cursor = index;
  }

  /**
   * In destination, opens location of source.
   */
  equal() {
    const { ls } =
      /** @type {TabService} */ (this.props.tabService);

    const { location } = this.getActiveTab();

    const panelId = this.getOppositeId();
    const tabId = this.getActiveTabId(panelId);

    ls(tabId, location);
  }

  /**
   * Opens next location in active panel history.
   */
  forward() {
    const tabId = this.getActiveTabId();
    this.go(tabId, 1);
  }

  /**
   * Returns place where active tab location belongs.
   *
   * @param {number} panelId
   */
  getActivePlace(panelId) {
    const { getActive } =
      /** @type {PlaceService} */ (this.props.placeService);

    const { location } = this.getActiveTab(panelId);
    const place = getActive(location);

    return place;
  }

  /**
   * Returns active tab in panel.
   *
   * @param {number=} panelId
   */
  getActiveTab(panelId) {
    const { entities } =
      /** @type {TabService} */ (this.props.tabService);

    const tabId = this.getActiveTabId(panelId);
    return entities[tabId];
  }

  /**
   * Returns id of active tab in panel.
   *
   * @param {number=} panelId
   */
  getActiveTabId(panelId) {
    if (typeof panelId !== "number") {
      panelId = this.activeId;
    }

    return this.entities[panelId].activeTabId;
  }

  /**
   * Returns id of the panel in which a given tab is.
   *
   * @param {number} tabId
   */
  getIdByTab(tabId) {
    return this.entities[0].tabIds.indexOf(tabId) > -1 ? 0 : 1;
  }

  /**
   * In tab, loads a URI from its panel history.
   *
   * @param {number} tabId
   * @param {number} delta
   */
  go(tabId, delta) {
    const panelId = this.getIdByTab(tabId);
    const panel = this.entities[panelId];

    if (panel.now + delta >= panel.history.length) {
      return;
    }

    const { ls } =
      /** @type {TabService} */ (this.props.tabService);

    ls(tabId, panel.history[panel.now + delta], () => {
      panel.now = panel.now + delta;
    });
  }

  /**
   * Opens parent location.
   *
   * @param {number=} panelId
   */
  levelUp(panelId) {
    const { entities } =
      /** @type {TabService} */ (this.props.tabService);

    if (typeof panelId !== "number") {
      panelId = this.activeId;
    }

    const tabId = this.getActiveTabId(panelId);
    const { location } = entities[tabId];
    const nextLocation = NativeFile.new_for_uri(location).get_parent();

    this.ls(nextLocation ? nextLocation.get_uri() : "file:///", tabId);
  }

  /**
   * @param {string=} uri
   * @param {number=} tabId
   */
  ls(uri, tabId) {
    const { alert, prompt } =
      /** @type {DialogService} */ (this.props.dialogService);

    const { mount, refresh } =
      /** @type {PlaceService} */ (this.props.placeService);

    const { entities, ls } =
      /** @type {TabService} */ (this.props.tabService);

    if (typeof uri !== "string") {
      prompt("List files at URI: ", "", input => {
        if (!input) {
          return;
        }

        if (input.indexOf("file:///") === 0) {
          this.ls(input);
          return;
        }

        if (input[0] === "/") {
          this.ls("file://" + input);
          return;
        }

        mount(input, (error, finalUri) => {
          if (error) {
            alert(error.message);
          } else {
            this.ls(finalUri);
            refresh();
          }
        });
      });

      return;
    }

    if (!tabId) {
      tabId = this.getActiveTabId();
    }

    ls(tabId, uri, error => {
      if (error) {
        alert(error.message, () => {
          if (entities[tabId].location !== "file:///") {
            this.ls("file:///", tabId);
          }
        });

        return;
      }

      this.pushLocation({ tabId, uri });
    });
  }

  /**
   * Sets the next tab in panel as active, or the first if the last
   * is active.
   */
  nextTab() {
    const { activeTabId, tabIds } = this.entities[this.activeId];

    let index = tabIds.indexOf(activeTabId) + 1;

    if (index >= tabIds.length) {
      index = 0;
    }

    this.setActiveTab(tabIds[index]);
  }

  /**
   * Sets panel location, taking from other panel if same root.
   *
   * @param {number} panelId
   * @param {Place} place
   */
  openPlace(panelId, place) {
    const { mountUuid } =
      /** @type {PlaceService} */ (this.props.placeService);

    if (!place.rootUri) {
      mountUuid(Nullthrows(place.uuid), () => {
        this.openPlace(panelId, place);
      });

      return;
    }

    const other = this.getOppositeId(panelId);
    const otherTab = this.getActiveTab(other);
    const otherPlace = this.getActivePlace(other);

    this.setActive(panelId);

    this.ls(
      otherPlace === place ? otherTab.location : place.rootUri,
      panelId,
    );
  }

  /**
   * Sets the previous tab in panel as active, or the last if the first
   * is active.
   */
  prevTab() {
    const { activeTabId, tabIds } = this.entities[this.activeId];

    let index = tabIds.indexOf(activeTabId) - 1;

    if (index < 0) {
      index = tabIds.length - 1;
    }

    this.setActiveTab(tabIds[index]);
  }

  /**
   * Adds to a panel history.
   *
   * @param {{ tabId: number, uri: string }} props
   */
  pushLocation(props) {
    const { tabId, uri } = props;
    const panelId = this.getIdByTab(tabId);
    const panel = this.entities[panelId];
    panel.history = panel.history.slice(0, panel.now + 1).concat(uri);
    panel.now = panel.now + 1;
  }

  /**
   * Refreshes file lists. If receives error, displays message instead.
   *
   * @param {{ message: string }=} error
   */
  refresh(error) {
    const { alert } =
      /** @type {DialogService} */ (this.props.dialogService);

    const { entities, ls } =
      /** @type {TabService} */ (this.props.tabService);

    if (error) {
      alert(error.message);
      return;
    }

    const panel0TabId = this.entities[0].activeTabId;
    const panel1TabId = this.entities[1].activeTabId;

    ls(panel0TabId, entities[panel0TabId].location);
    ls(panel1TabId, entities[panel1TabId].location);
  }

  /**
   * Removes tab by id, or active tab if not specified.
   *
   * @param {number=} tabId
   */
  removeTab(tabId) {
    if (typeof tabId !== "number") {
      tabId = this.getActiveTabId();
    }

    const panel = this.entities[this.getIdByTab(tabId)];
    let { activeTabId, tabIds } = panel;

    if (tabIds.length === 1) {
      return;
    }

    let index = tabIds.indexOf(tabId);
    panel.tabIds = tabIds.filter(x => x !== tabId);

    if (activeTabId === tabId) {
      tabIds = panel.tabIds;
      index = Math.min(index, tabIds.length - 1);
      panel.activeTabId = tabIds[index];
    }
  }

  /**
   * @param {number} panelId
   */
  root(panelId) {
    const { getActive } =
      /** @type {PlaceService} */ (this.props.placeService);

    const tabId = this.getActiveTabId(panelId);
    const { location } = this.getActiveTab(panelId);
    const { rootUri } = getActive(location);

    this.ls(/** @type {string} */(rootUri), tabId);
  }

  /**
   * @param {number} panelId
   * @param {number[]} selected
   */
  selected(panelId, selected) {
    this.setActive(panelId);
    this.getActiveTab().selected = selected;
  }

  /**
   * Sets panel as active.
   *
   * @param {number} id
   */
  setActive(id) {
    this.activeId = id;
  }

  /**
   * Sets tab as active in its panel.
   *
   * @param {number} tabId
   */
  setActiveTab(tabId) {
    const id = this.getIdByTab(tabId);
    this.entities[id].activeTabId = tabId;
  }

  /**
   * Opens source location in destination panel, and vice versa.
   */
  swap() {
    const { entities, ls } =
      /** @type {TabService} */ (this.props.tabService);

    const panel0TabId = this.entities[0].activeTabId;
    const panel1TabId = this.entities[1].activeTabId;

    const { location } = entities[panel0TabId];
    const location1 = entities[panel1TabId].location;

    ls(panel0TabId, location1);
    ls(panel1TabId, location);
  }

  /**
   * Sets the inactive panel as active.
   */
  toggleActive() {
    this.activeId = this.activeId === 0 ? 1 : 0;
  }

  /**
   * @private
   * @param {number} tabId
   * @param {number} delta
   */
  getLocation(tabId, delta) {
    const panelId = this.getIdByTab(tabId);
    const { history, now } = this.entities[panelId];
    const nextNow = now + delta;

    return nextNow < 0 || nextNow > history.length - 1
      ? null
      : history[nextNow];
  }

  /**
   * Returns an id not assigned to any existing tab.
   *
   * @private
   */
  getNextTabId() {
    const ids = this.entities[0].tabIds.concat(this.entities[1].tabIds);
    return Math.max.apply(null, ids) + 1;
  }

  /**
   * Returns id of the other panel.
   *
   * @private
   * @param {number=} panelId
   */
  getOppositeId(panelId) {
    if (!panelId) {
      panelId = this.activeId;
    }

    return panelId === 0 ? 1 : 0;
  }
}

exports.PanelService = PanelService;
