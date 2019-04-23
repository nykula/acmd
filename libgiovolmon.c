#include <gio/gio.h>
#include <glib-object.h>
#include <glib.h>

G_DECLARE_FINAL_TYPE(VlnMonitor, vln_monitor, VLN, MONITOR, GVolumeMonitor);
struct _VlnMonitor {
  int count;
  GVolumeMonitor parent_instance;
};
G_DEFINE_TYPE(VlnMonitor, vln_monitor, G_TYPE_VOLUME_MONITOR);

VlnMonitor *vln_monitor_new(void) {
  return g_object_new(vln_monitor_get_type(), NULL);
}

void g_io_module_load(GIOModule *module) {
  g_type_module_use(G_TYPE_MODULE(module));
  g_io_extension_point_implement(G_VOLUME_MONITOR_EXTENSION_POINT_NAME,
                                 vln_monitor_get_type(), "volmon", 0);
}

void g_io_module_unload(GIOModule *module) {
  g_type_module_unuse(G_TYPE_MODULE(module));
}

char **g_io_module_query(void) {
  char *eps[] = {G_VOLUME_MONITOR_EXTENSION_POINT_NAME, NULL};
  return g_strdupv(eps);
}

static GList *vln_monitor_get_volumes(GVolumeMonitor *self) {
  g_print("GET_VOLUMES %d\n", ++VLN_MONITOR(self)->count, NULL);
  return NULL;
}

static void vln_monitor_class_init(VlnMonitorClass *klass) {
  G_VOLUME_MONITOR_CLASS(klass)->get_volumes = vln_monitor_get_volumes;
}

static void vln_monitor_init(VlnMonitor *self) {}
