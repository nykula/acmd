#include <gtk/gtk.h>

GApplication *TT_app;

static char watch(GIOChannel *out, GIOCondition cond) {
  if (cond == G_IO_HUP) {
    g_io_channel_unref(out);
    g_application_release(TT_app);
    return 0;
  }
  size_t len = 0;
  char *line = 0;
  g_io_channel_read_line(out, &line, &len, 0, 0);
  line[--len] = 0;
  printf("%s\n", g_strreverse(line));
  g_free(line);
  return 1;
}

static void activate() {
  int out = 0;
  g_application_hold(TT_app);
  g_spawn_async_with_pipes(0, (char *[]){"./find"}, 0, 0, 0, 0, 0, 0, &out, 0,
                           0);
  g_io_add_watch(g_io_channel_unix_new(out), G_IO_HUP | G_IO_IN, (GIOFunc)watch,
                 0);
}

int main() {
  TT_app = g_application_new("io.github.makepost.test.rev", 0);
  g_signal_connect(TT_app, "activate", G_CALLBACK(activate), 0);
  g_application_run(TT_app, 0, 0);
}
