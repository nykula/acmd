#include <gtk/gtk.h>

///** @param {{ $dot: SimpleAction & { value: boolean }, menu: Menu }} props */
//constructor(props) {
//  super();
//  this.$title = this.state(this.title, "");
//  /** @private */ this.$def = this.state(this.def, "");
//  /** @private */ this.$go = this.state(this.go, "");
//  /** @private */ this.$mount = this.zero(this.mount);
//  /** @private */ this.$scroll = new ScrolledWindow();
//  /** @private */ this.$tree = new TreeView();
//  /** @private */ this.files = new ListStore();
//  /** @private @type {FileMonitor?} */ this.monit = null;
//  /** @private */ this.order = new Files.Order();
//  /** @private */ this.props = props;
//  /** @private */ this.stop = new Cancellable();
//  /** @private */ this.visible = new TreeModelFilter();
//  this.zero(this.close);
//  this.zero(this.delete);
//  this.param(this.launch);
//  this.zero(this.rename);
//  this.zero(this.reset);
//  this.zero(this.sh);
//  this.zero(this.up);
//  this.menu.append_section(null, (this.$launch = new Menu()));
//  this.menu.append_submenu(gettext("Default app"), (this.$defs = new Menu()));
//  const sys = new Menu();
//  sys.append(gettext("Sh"), Files.sh());
//  sys.append(gettext("Mount"), Files.mount());
//  this.menu.append_section(null, sys);
//  this.menu.append_section(null, this.props.menu);
//  this.menu.append(gettext("Level up"), Files.up());
//  const remove = new Menu();
//  remove.append(gettext("Delete"), Files.delete());
//  remove.append(gettext("Rename"), Files.rename());
//  this.menu.append_section(null, remove);
//  const close = new Menu();
//  close.append(gettext("Close"), Files.close());
//  this.menu.append_section(null, close);
//}
//
//render() {
//  const $tree = new TreeView({ headers_visible: false });
//  $tree.insert_action_group(Files.name, this.group);
//  $tree.connect("button-press-event", (_, ev) => (this.popup(ANY(ev)), !1));
//  $tree.connect("popup-menu", () => this.popup(null));
//  $tree.connect("row-activated", () => this.activate());
//  this.props.$dot.connect("notify::state", () => this.visible.refilter());
//
//  const $name = new TreeViewColumn({ expand: true, title: gettext("Name") });
//  $name.clickable = true;
//  $name.connect("clicked", () => this.order.sort(Files.Name.id));
//  this.order.watches.push(() => {
//    $name.sort_indicator = this.order.id === Files.Name.id;
//    $name.sort_order = this.order.asc ? 0 : 1;
//  });
//  const icon = new CellRendererPixbuf();
//  $name.pack_start(icon, false);
//  $name.add_attribute(icon, "gicon", Files.Icon.id);
//  const name = new CellRendererText({ ellipsize: EllipsizeMode.START });
//  $name.pack_start(name, true);
//  $name.add_attribute(name, "text", Files.Name.id);
//  $name.set_cell_data_func(name, (_, cell, ___, $x) => {
//    if (Row.get(this.visible, $x, Files.Type) !== Files.ItemType.File) {
//      ANY(cell).text = `[${ANY(cell).text}]`;
//    }
//  });
//  $tree.append_column($name);
//
//  const $mtime = new TreeViewColumn({ title: gettext("UTC") });
//  $mtime.clickable = true;
//  $mtime.connect("clicked", () => this.order.sort(Files.Mtime.id));
//  this.order.watches.push(() => {
//    $mtime.sort_indicator = this.order.id === Files.Mtime.id;
//    $mtime.sort_order = this.order.asc ? 0 : 1;
//  });
//  const mtime = new CellRendererText();
//  $mtime.pack_start(mtime, true);
//  $mtime.add_attribute(mtime, "text", Files.Mtime.id);
//  $mtime.set_cell_data_func(mtime, (_, cell, ___, $x) => {
//    const x = new Date(Row.get(this.visible, $x, Files.Mtime));
//    ANY(cell).text = x.toLocaleString().replace(/,/g, "");
//  });
//  $tree.append_column($mtime);
//
//  const $scroll = new ScrolledWindow({ hscrollbar_policy: PolicyType.NEVER });
//  $scroll.add((this.$tree = $tree));
//  return (this.$scroll = $scroll);
//}
//
///** @private */
//activate() {
//  const { $x, file } = this.cursor();
//  const type = Row.get(this.visible, $x, Files.Type);
//  if (type === Files.ItemType.Self) {
//    this.up();
//  } else if (type === Files.ItemType.Dir) {
//    this.go(file.get_uri());
//  } else {
//    this.popup(null);
//  }
//}
//
///** @private @param {File} f @param {File?} f0 @param {Number} ev */
//async changed(f, f0, ev) {
//  const xs = this.files;
//  const x = f.get_uri();
//  print(x, Object.keys(Ev)[ev]); // FIXME
//  if (ev === Ev.ATTRIBUTE_CHANGED || ev === Ev.CHANGED) {
//    const i = await this.item(f);
//    Row.eq(xs, Files.Uri, x, $x => this.row(i, $x));
//  } else if (ev === Ev.CREATED) {
//    this.row(await this.item(f), this.files.append());
//  } else if (ev === Ev.DELETED) {
//    Row.eq(xs, Files.Uri, x, $x => this.files.remove($x));
//  } else if (ev === Ev.RENAMED) {
//    const i = await this.item(/** @type {File} */ ANY(f0));
//    Row.eq(xs, Files.Uri, x, $x => this.row(i, $x));
//  }
//}
//
///** @private */
//close() {
//  this.$scroll.destroy();
//}
//
///** @private */
//cursor() {
//  const cell = this.$tree.get_cell_area(...this.$tree.get_cursor());
//  cell.y += cell.height * 1.5;
//  const $x = this.visible.get_iter(ANY(this.$tree.get_cursor())[0])[1];
//  const file = File.new_for_uri(Row.get(this.visible, $x, Files.Uri));
//  return { $x, cell, file };
//}
//
///** @private @param {string} id */
//async def(id) {
//  this.inf(id).set_as_default_for_type(await this.t());
//}
//
///** @private */
//async delete() {
//  const cmd = "rm -rfv %U";
//  const opt = AppInfoCreateFlags.NEEDS_TERMINAL;
//  const ai = AppInfo.create_from_commandline(cmd, null, opt);
//  ai.launch_uris([this.cursor().file.get_uri()], null);
//}
//
///** @private @param {string} uri */
//async go(uri) {
//  const dir = File.new_for_uri(uri);
//  await this.title(dir.get_basename());
//  [this.monit, this.stop].map(x => x && x.cancel());
//  const files = (this.files = new ListStore());
//  files.set_column_types(
//    ANY(Files.Columns.map(x => Object.getPrototypeOf(x.type)))
//  );
//  this.order.def = () => this.sort();
//  this.order.watches.concat(this.order.def).map(x => x());
//  files.set_sort_column_id(-1, 0);
//  this.monit = dir.monitor_directory(0, null);
//  this.monit.connect("changed", (_, f, f0, ev) =>
//    this.changed(f, f0, ev).catch(logError)
//  );
//  const visible = new TreeModelFilter({ child_model: files });
//  visible.set_visible_func(
//    (_, $x) =>
//      this.props.$dot.value ||
//      Files.Visible.test(Row.get(files, $x, Files.Name))
//  );
//  const stop = (this.stop = new Cancellable());
//  /** @type {Find[]} */ const chunk = [];
//  const flush = () => {
//    chunk.splice(0).map(y => this.row(y, files.append()));
//    this.$tree.set_model((this.visible = visible));
//    this.$tree.set_search_equal_func((_, ___, x, $x) => {
//      x = x.toLowerCase();
//      return !pattern_match_simple(
//        x.indexOf("*") === -1 ? `*${x.replace(/(.)/g, "$1*")}` : x,
//        Row.get(visible, $x, Files.Name).toLowerCase()
//      );
//    });
//    this.$tree.set_search_column(Files.Name.id);
//    this.$tree.headers_visible = true;
//    this.order.watches.concat(this.order.def).map(x => x());
//  };
//  await Find.find([dir], stop, x =>
//    x.depth > 1 ? stop.cancel() : chunk.push(x) % 50 || flush()
//  );
//  flush();
//}
//
///** @private @param {string} id */
//inf(id) {
//  return AppInfo.get_all().filter(x => x.get_id() === id)[0];
//}
//
///** @private @param {File} file */
//async item(file) {
//  const info = file.query_info_finish(
//    await new Promise(r =>
//      file.query_info_async("*", 0, 0, null, (_, $) => r($))
//    )
//  );
//  return { file, info };
//}
//
///** @private @param {string} id */
//launch(id) {
//  this.inf(id).launch([this.cursor().file], null);
//}
//
///** @private */
//mount() {
//  const cmd = "sh -c 'mount %U || cat > /dev/null'";
//  const opt = AppInfoCreateFlags.NEEDS_TERMINAL;
//  const ai = AppInfo.create_from_commandline(cmd, null, opt);
//  ai.launch_uris([this.cursor().file.get_uri()], null);
//}
//
///** @private @param {Event?} ev */
//async popup(ev) {
//  const { cell, file } = this.cursor();
//  const mounts = VolumeMonitor.get().get_mounts();
//  const mount =
//    unix_mount_points_get()[0].some(
//      x => x.get_mount_path() === file.get_path() && x.is_user_mountable()
//    ) && !mounts.some(y => y.get_root().get_path() === file.get_path());
//  this.$mount.set_enabled(mount);
//  const t = await this.t();
//  const def = AppInfo.get_default_for_type(t, false);
//  this.$def.set_state(Variant.new_string(def ? def.get_id() : ""));
//  const apps = [def]
//    .concat(AppInfo.get_recommended_for_type(t))
//    .concat(AppInfo.get_fallback_for_type(t))
//    .filter(
//      (x, i, $) => x && i === $.findIndex(a => a.get_id() === x.get_id())
//    );
//  this.$defs.remove_all();
//  apps.map(x => this.$defs.append(x.get_name(), Files.def(x.get_id())));
//  this.$defs.append(gettext("Reset associations"), Files.reset());
//  this.$launch.remove_all();
//  apps.map(x => this.$launch.append(x.get_name(), Files.launch(x.get_id())));
//  this.$tree.insert_action_group(Files.name, this.group);
//  const $menu = M.new_from_model(this.menu);
//  $menu.attach_to_widget(this.$tree, null);
//  if (ev && ev.triggers_context_menu()) {
//    $menu.popup_at_pointer(ev);
//  } else if (!ev) {
//    const $win = ANY(this.$tree.get_window());
//    $menu.popup_at_rect($win, cell, Gravity.NORTH, Gravity.NORTH_WEST, null);
//  }
//}
//
///** @private */
//rename() {
//  const $msg = new MessageDialog({
//    buttons: ButtonsType.CANCEL,
//    title: gettext("Rename")
//  });
//  const $name = new Entry({ text: this.cursor().file.get_basename() });
//  $name.connect("activate", async () => {
//    const { file } = this.cursor();
//    const { text } = $name;
//    $msg.destroy();
//    try {
//      file.set_display_name_finish(
//        await new Promise(r =>
//          file.set_display_name_async(text, 0, null, (_, $) => r($))
//        )
//      );
//    } catch (error) {
//      logError(error);
//    }
//  });
//  ANY($msg.get_message_area()).add($name);
//  $msg.show_all();
//}
//
///** @private */
//async reset() {
//  AppInfo.reset_type_associations(await this.t());
//}
//
///** @private @param {{ file: File, info: FileInfo }} x @param {TreeIter} $x */
//row(x, $x) {
//  const uri = x.file.get_uri();
//  const xs = this.files;
//  const d = x.info.get_file_type() === FileType.DIRECTORY;
//  const { tv_sec, tv_usec } = x.info.get_modification_time();
//  const row = new Row();
//  row.set(Files.Mtime, tv_sec * 1000 + Math.floor(tv_usec / 1000));
//  row.set(Files.Uri, uri);
//  if (uri === this.$go.value) {
//    row.set(Files.Icon, Icon.new_for_string("go-up-symbolic"));
//    row.set(Files.Name, x.file.get_parent() ? ".." : ".");
//    row.set(Files.Type, Files.ItemType.Self);
//  } else {
//    row.set(Files.Icon, x.info.get_icon());
//    row.set(Files.Name, x.info.get_display_name());
//    row.set(Files.Type, d ? Files.ItemType.Dir : Files.ItemType.File);
//  }
//  xs.set($x, row.ids, row.values);
//}
//
///** @private */
//sh() {
//  const cmd = "sh -c 'cd %U; exec $SHELL -l'";
//  const opt = AppInfoCreateFlags.NEEDS_TERMINAL;
//  const ai = AppInfo.create_from_commandline(cmd, null, opt);
//  ai.launch_uris([ANY(this.cursor().file.get_parent()).get_uri()], null);
//}
//
///** @private */
//sort() {
//  const xs = this.files;
//  /** @type {(a: TreeIter, b: TreeIter) => number} */ const vip = (a, b) =>
//    Row.get(xs, a, Files.Type) - Row.get(xs, b, Files.Type);
//  /** @type {(a: TreeIter, b: TreeIter) => boolean} */ const before =
//    this.order.id === Files.Mtime.id
//      ? (a, b) => Row.get(xs, a, Files.Mtime) < Row.get(xs, b, Files.Mtime)
//      : (a, b) => Row.get(xs, a, Files.Name) < Row.get(xs, b, Files.Name);
//  xs.set_default_sort_func(
//    this.order.asc
//      ? (_, a, b) => vip(a, b) || (before(a, b) ? -1 : 1)
//      : (_, a, b) => vip(a, b) || (before(a, b) ? 1 : -1)
//  );
//}
//
///** @private */
//async t() {
//  return (await this.item(this.cursor().file)).info.get_content_type();
//}
//
///** @private @param {string} _ */
//async title(_) {
//  return;
//}
//
///** @private */
//up() {
//  const cur = File.new_for_uri(this.$go.value);
//  this.go((cur.get_parent() || cur).get_uri());
//}
//
//les.close = Files.zero(Files.prototype.close);
//les.def = Files.one(Files.prototype.def);
//les.delete = Files.zero(Files.prototype.delete);
//les.launch = Files.one(Files.prototype.launch);
//les.mount = Files.zero(Files.prototype.mount);
//les.rename = Files.zero(Files.prototype.rename);
//les.reset = Files.zero(Files.prototype.reset);
//les.sh = Files.zero(Files.prototype.sh);
//les.up = Files.zero(Files.prototype.up);
//* @enum {Number} */ Files.ItemType = { Self: 0, Dir: 1, File: 2 };
//les.Columns = [
//(Files.Icon = { id: 0, type: Icon.new_for_string("computer") }),
//(Files.Mtime = { id: 0, type: 0 }),
//(Files.Name = { id: 0, type: "" }),
//(Files.Type = { id: 0, type: Files.ItemType.Self }),
//(Files.Uri = { id: 0, type: "" })
//map((x, i) => ((x.id = i), x));
//les.Order = class Order {
//constructor() {
//  /** @type {boolean} */ this.asc = false;
//  /** @type {() => void} */ this.def = () => undefined;
//  /** @type {number} */ this.id = -1;
//  /** @type {(() => void)[]} */ this.watches = [];
//}
//
///** @param {number} id */
//sort(id) {
//  this.asc = this.id === id ? !this.asc : id === Files.Name.id;
//  this.id = id;
//  this.watches.concat(this.def).map(x => x());
//}
//Files.Visible = /^([^.]|\.\.$)/;
//
//constructor() {
//  super();
//  this.$dot = this.bool(this.dot, false);
//  this.menu.append(gettext("Show .*"), Win.dot());
//}
//
///** @private @param {boolean} _ */
//dot(_) {
//  return;
//}
//Win.dot = Win.zero(Win.prototype.dot);
//
//app.set_accels_for_action(Files.up(), ["BackSpace", "<Alt>Up"]);
//app.set_accels_for_action(Win.dot(), ["<Ctrl>H"]);
//app.set_accels_for_action(Files.rename(), ["<Ctrl>M"]);
//app.set_accels_for_action(Files.close(), ["<Ctrl>W"]);
//app.set_accels_for_action(Files.delete(), ["<Shift>Delete"]);
//app.run([imports.system.programInvocationName].concat(ARGV));

void activate(GtkApplication *app, gpointer _){
  GtkWidget *$app=gtk_application_window_new(app);
  //gtk_widget_insert_action_group($app,Win.name,this.group);
  gtk_window_set_default_size(GTK_WINDOW($app),400,600);
  //const files = new Files({ $dot: this.$dot, menu: this.menu });
  //files.$title.connect("notify::state", () => {
  //  $app.title = files.$title.value;
  //});
  //const $files = files.render();
  //$files.connect("destroy", () => $app.close());
  //$app.add($files);
  //files.go(File.new_for_path(get_home_dir()).get_uri());
  //files.order.sort(Files.Name.id);
  gtk_widget_show_all($app);
}

int main(int argc, char **argv) {
  GtkApplication *app=gtk_application_new("org.js.acme", 0);
  g_signal_connect(app,"activate",G_CALLBACK(activate),NULL);
  return g_application_run(G_APPLICATION(app),argc,argv);
}
