#include <EGL/egl.h>
#include <GLES2/gl2.h>
#include <png.h>
#include <stdio.h>
#include <string.h>
#include <sys/mman.h>
#include <unistd.h>
#include <wayland-client.h>
#include <wayland-egl.h>
#include <xkbcommon/xkbcommon.h>

#include <ft2build.h>
#include FT_FREETYPE_H

#define FG 1
#define PX 64

static struct {
  char done;
  char init;
  struct wl_keyboard *k;
  struct xkb_state *ks;
  struct wl_pointer *p;
  FT_Face sans;
  struct wl_shell_surface *sh;
  struct wl_egl_window *win;
  struct wl_surface *wl;
} TT;

static void blur(void *_, struct wl_keyboard *kbd, uint32_t serial,
                 struct wl_surface *wl) {
  puts("blur");
}

static void enter(void *_, struct wl_pointer *p, uint32_t serial,
                  struct wl_surface *wl, int32_t x, int32_t y) {
  printf("enter %f %f\n", wl_fixed_to_double(x), wl_fixed_to_double(y));
}

static void init(void *_, struct wl_registry *wl, uint32_t name,
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

static void key(void *_, struct wl_keyboard *kbd, uint32_t serial,
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

static void leave(void *_, struct wl_pointer *p, uint32_t serial,
                  struct wl_surface *wl) {
  puts("leave");
}

static void map(void *_, struct wl_keyboard *kbd, uint32_t fmt, int32_t fd,
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

static void mod(void *_, struct wl_keyboard *kbd, uint32_t serial,
                uint32_t depr, uint32_t latch, uint32_t lock, uint32_t grp) {
  xkb_state_update_mask(TT.ks, depr, latch, lock, 0, 0, grp);
  printf("mod %d %d %d %d\n", depr, latch, lock, grp);
}

static void move(void *_, struct wl_pointer *p, uint32_t time, int32_t x,
                 int32_t y) {
  printf("move %f %f\n", wl_fixed_to_double(x), wl_fixed_to_double(y));
}

static void ping(void *_, struct wl_shell_surface *sh, uint32_t serial) {
  wl_shell_surface_pong(sh, serial);
  puts("pong");
}

static void press(void *_, struct wl_pointer *p, uint32_t serial, uint32_t time,
                  uint32_t btn, uint32_t state) {
  printf("press %d %d\n", btn, state);
}

static void resize(void *_, struct wl_shell_surface *sh, uint32_t edges,
                   int32_t w, int32_t h) {
  wl_egl_window_resize(TT.win, w, h, 0, 0);
  printf("resize %d %d %d", edges, w, h);
}

static void scroll(void *_, struct wl_pointer *p, uint32_t time, uint32_t axis,
                   int32_t value) {
  printf("scroll %s %f\n", axis ? "x" : "y", wl_fixed_to_double(value));
}

static void word(char *txt) {
  FT_Bitmap bmp;
  unsigned char buf;
  FT_GlyphSlot glyph = TT.sans->glyph;
  int i, j, p, q;
  FT_Vector pen;

  glEnable(GL_SCISSOR_TEST);
  pen.x = 300 * PX, pen.y = (480 - 200) * PX;
  while (*txt) {
    FT_Set_Transform(TT.sans, 0, &pen);
    FT_Load_Char(TT.sans, *txt++, FT_LOAD_RENDER);
    bmp = glyph->bitmap;
    for (i = glyph->bitmap_left, p = 0; p < bmp.width; i++, p++)
      for (j = 480 - glyph->bitmap_top, q = 0; q < bmp.rows; j++, q++)
        if (i >= 0 && j >= 0 && i < 640 && j < 480 &&
            (buf = bmp.buffer[q * bmp.width + p])) {
          glScissor(i, 480 - j, 1, 1);
          glClearColor(0.0 + FG * buf / 255.0, 0.6 + FG * buf / 255.0,
                       0.8 + FG * buf / 255.0, 1);
          glClear(GL_COLOR_BUFFER_BIT);
        }
    pen.x += glyph->advance.x, pen.y += glyph->advance.y;
  }
  glDisable(GL_SCISSOR_TEST);
}

static void focus(void *_, struct wl_keyboard *kbd, uint32_t serial,
                  struct wl_surface *wl, struct wl_array *keys) {
  uint32_t *k;
  wl_array_for_each(k, keys)
      key(0, kbd, serial, 0, *k, WL_KEYBOARD_KEY_STATE_PRESSED);
  puts("focus");
}

int main() {
  int cfgc;
  EGLConfig cfgv;
  EGLContext ctx;
  struct wl_display *dpy = wl_display_connect(0);
  EGLDisplay egl = eglGetDisplay((EGLNativeDisplayType)dpy);
  FT_Library ft;
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
  FT_Init_FreeType(&ft);
  FT_New_Face(ft, "/share/fonts/liberation-fonts/LiberationSans-Regular.ttf", 0,
              &TT.sans);
  FT_Set_Char_Size(TT.sans, 14 * PX, 0, 0, 0);

  FILE *fp = fopen("/share/icons/Tango/16x16/places/folder.png", "rb");
  char header[8];
  png_infop info_ptr;
  png_structp png_ptr;
  png_bytep *row_pointers;
  int h, w, x, y;

  fread(header, 1, 8, fp);
  png_ptr = png_create_read_struct(PNG_LIBPNG_VER_STRING, 0, 0, 0);
  info_ptr = png_create_info_struct(png_ptr);
  setjmp(png_jmpbuf(png_ptr));
  png_init_io(png_ptr, fp);
  png_set_sig_bytes(png_ptr, 8);
  png_read_info(png_ptr, info_ptr);
  h = png_get_image_height(png_ptr, info_ptr);
  w = png_get_image_width(png_ptr, info_ptr);
  png_set_interlace_handling(png_ptr);
  png_read_update_info(png_ptr, info_ptr);
  setjmp(png_jmpbuf(png_ptr));
  row_pointers = (png_bytep *)malloc(sizeof(png_bytep) * h);
  for (y = 0; y < h; y++)
    row_pointers[y] = (png_byte *)malloc(png_get_rowbytes(png_ptr, info_ptr));
  png_read_image(png_ptr, row_pointers);
  fclose(fp);

  glEnable(GL_BLEND);
  do
    if ((TT.init < 2 && TT.init++ < 2) || !wl_display_dispatch(dpy)) {
      glClearColor(0.0, 0.6, 0.8, 1);
      glClear(GL_COLOR_BUFFER_BIT);
      glEnable(GL_SCISSOR_TEST);
      glScissor(5, 480 - 5 - 10, 10, 10);
      glClearColor(1, 0, 0, 0);
      glClear(GL_COLOR_BUFFER_BIT);
      glDisable(GL_SCISSOR_TEST);
      word("FreeType2");

      glEnable(GL_SCISSOR_TEST);
      for (y = 0; y < h; y++) {
        png_byte *row = row_pointers[y];
        for (x = 0; x < w; x++) {
          png_byte *ptr = &(row[x * 4]);
          glScissor(50 + x, 50 - y, 1, 1);
          glClearColor(
              0.0 * (1 - ptr[3] / 255.0) + *ptr / 255.0 * (ptr[3] / 255.0),
              0.6 * (1 - ptr[3] / 255.0) + ptr[1] / 255.0 * (ptr[3] / 255.0),
              0.8 * (1 - ptr[3] / 255.0) + ptr[2] / 255.0 * (ptr[3] / 255.0),
              1);
          glClear(GL_COLOR_BUFFER_BIT);
        }
      }
      glDisable(GL_SCISSOR_TEST);

      eglSwapBuffers(egl, win);
      puts("HERE");
    }
  while (!TT.done);

  for (y = 0; y < h; y++)
    free(row_pointers[y]);
  free(row_pointers);

  FT_Done_Face(TT.sans);
  FT_Done_FreeType(ft);
  eglDestroyContext(egl, ctx);
  eglDestroySurface(egl, win), wl_egl_window_destroy(TT.win);
  wl_shell_surface_destroy(TT.sh);
  wl_pointer_destroy(TT.p), wl_keyboard_destroy(TT.k);
  wl_surface_destroy(TT.wl);
  eglTerminate(egl), wl_display_disconnect(dpy);
}
