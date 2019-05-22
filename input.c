#include <EGL/egl.h>
#include <GLES2/gl2.h>
#include <stdio.h>
#include <string.h>
#include <sys/mman.h>
#include <unistd.h>
#include <wayland-client.h>
#include <wayland-egl.h>
#include <xkbcommon/xkbcommon.h>

static struct {
  char done;
  struct wl_keyboard *k;
  struct xkb_state *ks;
  struct wl_pointer *p;
  struct wl_shell_surface *sh;
  struct wl_egl_window *win;
  struct wl_surface *wl;
} TT;

static void key(void *data, struct wl_keyboard *kbd, uint32_t serial,
                uint32_t time, uint32_t key, uint32_t state) {
  char *s = state == WL_KEYBOARD_KEY_STATE_PRESSED ? "press" : "release";
  xkb_keysym_t sym = xkb_state_key_get_one_sym(TT.ks, key + 8);
  uint32_t u = xkb_keysym_to_utf32(sym);
  if (u >= 0x21 && u <= 0x7e) {
    printf("key %s %c\n", s, (char)u);
    TT.done = state == WL_KEYBOARD_KEY_STATE_PRESSED && u == 'q';
  } else if (u)
    printf("key %s u+%04X\n", s, u);
  else {
    char name[64];
    xkb_keysym_get_name(sym, name, 64);
    printf("key %s %s\n", s, name);
  }
}

static void blur(void *data, struct wl_keyboard *kbd, uint32_t serial,
                 struct wl_surface *wl) {
  puts("blur");
}

static void enter(void *data, struct wl_pointer *p, uint32_t serial,
                  struct wl_surface *wl, int32_t x, int32_t y) {
  printf("enter %f %f\n", wl_fixed_to_double(x), wl_fixed_to_double(y));
}

static void focus(void *data, struct wl_keyboard *kbd, uint32_t serial,
                  struct wl_surface *wl, struct wl_array *keys) {
  uint32_t *k;
  wl_array_for_each(k, keys)
      key(0, kbd, serial, 0, *k, WL_KEYBOARD_KEY_STATE_PRESSED);
  puts("focus");
}

static void init(void *data, struct wl_registry *wl, uint32_t name,
                 const char *iface, uint32_t ver) {
  if (!strcmp(iface, "wl_compositor"))
    TT.wl = wl_compositor_create_surface(
        wl_registry_bind(wl, name, &wl_compositor_interface, 1));
  else if (!strcmp(iface, "wl_seat")) {
    struct wl_seat *seat = wl_registry_bind(wl, name, &wl_seat_interface, 1);
    TT.k = wl_seat_get_keyboard(seat), TT.p = wl_seat_get_pointer(seat);
  } else if (!strcmp(iface, "wl_shell"))
    TT.sh = wl_shell_get_shell_surface(
        wl_registry_bind(wl, name, &wl_shell_interface, 1), TT.wl);
}

static void leave(void *data, struct wl_pointer *p, uint32_t serial,
                  struct wl_surface *wl) {
  puts("leave");
}

static void map(void *data, struct wl_keyboard *kbd, uint32_t fmt, int32_t fd,
                uint32_t size) {
  struct xkb_context *xkb = xkb_context_new(0);
  char *maps = mmap(0, size, PROT_READ, MAP_SHARED, fd, 0);
  struct xkb_keymap *map = xkb_keymap_new_from_string(xkb, maps, 1, 0);
  munmap(maps, size), close(fd);
  xkb_state_unref(TT.ks), TT.ks = xkb_state_new(map);
  printf("map %s\n", xkb_keymap_layout_get_name(map, 0));
  xkb_keymap_unref(map);
  xkb_context_unref(xkb);
}

static void mod(void *data, struct wl_keyboard *kbd, uint32_t serial,
                uint32_t depr, uint32_t latch, uint32_t lock, uint32_t grp) {
  xkb_state_update_mask(TT.ks, depr, latch, lock, 0, 0, grp);
  printf("mod %d %d %d %d\n", depr, latch, lock, grp);
}

static void move(void *data, struct wl_pointer *p, uint32_t time, int32_t x,
                 int32_t y) {
  printf("move %f %f\n", wl_fixed_to_double(x), wl_fixed_to_double(y));
}

static void ping(void *data, struct wl_shell_surface *sh, uint32_t serial) {
  wl_shell_surface_pong(sh, serial);
  puts("pong");
}

static void press(void *data, struct wl_pointer *p, uint32_t serial,
                  uint32_t time, uint32_t btn, uint32_t state) {
  printf("press %d %d\n", btn, state);
}

static void resize(void *data, struct wl_shell_surface *sh, uint32_t edges,
                   int32_t w, int32_t h) {
  wl_egl_window_resize(TT.win, w, h, 0, 0);
  printf("resize %d %d %d", edges, w, h);
}

static void scroll(void *data, struct wl_pointer *p, uint32_t time,
                   uint32_t axis, int32_t value) {
  printf("scroll %s %f\n", axis ? "x" : "y", wl_fixed_to_double(value));
}

int main() {
  int cfgc;
  EGLConfig cfgv;
  EGLContext ctx;
  struct wl_display *dpy = wl_display_connect(0);
  EGLDisplay egl = eglGetDisplay((EGLNativeDisplayType)dpy);
  EGLSurface win;

  eglInitialize(egl, 0, 0);
  eglChooseConfig(egl, (int[]){EGL_ALPHA_SIZE, 1, EGL_NONE}, &cfgv, 1, &cfgc);
  wl_registry_add_listener(wl_display_get_registry(dpy),
                           &(struct wl_registry_listener){&init, 0}, 0);
  wl_display_roundtrip(dpy);
  wl_keyboard_add_listener(
      TT.k, &(struct wl_keyboard_listener){&map, &focus, &blur, &key, &mod}, 0);
  wl_pointer_add_listener(
      TT.p,
      &(struct wl_pointer_listener){&enter, &leave, &move, &press, &scroll}, 0);
  wl_shell_surface_add_listener(
      TT.sh, &(struct wl_shell_surface_listener){&ping, &resize, 0}, 0);
  wl_shell_surface_set_toplevel(TT.sh);
  TT.win = wl_egl_window_create(TT.wl, 640, 480);
  win = eglCreateWindowSurface(egl, cfgv, (EGLNativeWindowType)TT.win, 0);
  eglMakeCurrent(egl, win, win,
                 ctx = eglCreateContext(egl, cfgv, EGL_NO_CONTEXT, 0));
  while (!TT.done) {
    wl_display_dispatch_pending(dpy);
    glClearColor(0xf3 / 255.0, 0xf2 / 255.0, 0xf1 / 255.0, 1.0);
    glClear(GL_COLOR_BUFFER_BIT);
    eglSwapBuffers(egl, win);
  }
  eglDestroyContext(egl, ctx);
  eglDestroySurface(egl, win), wl_egl_window_destroy(TT.win);
  wl_shell_surface_destroy(TT.sh);
  wl_pointer_destroy(TT.p), wl_keyboard_destroy(TT.k);
  wl_surface_destroy(TT.wl);
  eglTerminate(egl), wl_display_disconnect(dpy);
}
