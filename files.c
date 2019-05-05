#include <EGL/egl.h>
#include <GL/gl.h>
#include <stdio.h>
#include <string.h>
#include <wayland-client.h>
#include <wayland-egl.h>

struct TT {
  char done;
  char init;
  struct wl_shell *sh;
  struct wl_egl_window *win;
  struct wl_compositor *wl;
} TT;

static void init(void *_, struct wl_registry *wl, uint32_t name,
                 const char *iface, uint32_t ver) {
  if (!strcmp(iface, "wl_compositor"))
    TT.wl = wl_registry_bind(wl, name, &wl_compositor_interface, 1);
  else if (!strcmp(iface, "wl_shell"))
    TT.sh = wl_registry_bind(wl, name, &wl_shell_interface, 1);
}

static void ping(void *_, struct wl_shell_surface *sh, uint32_t serial) {
  wl_shell_surface_pong(sh, serial);
}

static void resize(void *_, struct wl_shell_surface *sh, uint32_t edges,
                   int32_t w, int32_t h) {
  wl_egl_window_resize(TT.win, w, h, 0, 0);
}

int main() {
  EGLint cfgc;
  EGLConfig cfgv;
  EGLContext ctx;
  struct wl_display *dpy = wl_display_connect(0);
  EGLDisplay egl;
  struct wl_shell_surface *sh;
  EGLSurface win;
  struct wl_surface *wl;

  eglInitialize(egl = eglGetDisplay((EGLNativeDisplayType)dpy), 0, 0);
  wl_registry_add_listener(wl_display_get_registry(dpy),
                           &(struct wl_registry_listener){&init, 0}, 0);
  wl_display_roundtrip(dpy);
  wl_shell_surface_add_listener(
      sh = wl_shell_get_shell_surface(TT.sh,
                                      wl = wl_compositor_create_surface(TT.wl)),
      &(struct wl_shell_surface_listener){&ping, &resize, 0}, 0);
  wl_shell_surface_set_toplevel(sh);
  eglChooseConfig(egl, 0, &cfgv, 1, &cfgc);
  TT.win = wl_egl_window_create(wl, 256, 256);
  win = eglCreateWindowSurface(egl, cfgv, (EGLNativeWindowType)TT.win, 0);
  eglMakeCurrent(egl, win, win,
                 ctx = eglCreateContext(egl, cfgv, EGL_NO_CONTEXT, 0));
  do
    if (TT.init++ < 2 || !wl_display_dispatch(dpy)) {
      glClear(GL_COLOR_BUFFER_BIT);
      glClearColor(0.0, 0.6, 0.8, 0.5);
      eglSwapBuffers(egl, win);
      puts("HERE");
    }
  while (!TT.done);
  eglDestroyContext(egl, ctx);
  eglDestroySurface(egl, win);
  wl_egl_window_destroy(TT.win);
  wl_shell_surface_destroy(sh);
  wl_surface_destroy(wl);
  eglTerminate(egl);
  wl_display_disconnect(dpy);
}
