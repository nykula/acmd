#include <EGL/egl.h>
#include <GLES2/gl2.h>
#include <png.h>
#include <stdio.h>
#include <string.h>
#include <wayland-client.h>
#include <wayland-egl.h>

#include <ft2build.h>
#include FT_FREETYPE_H

#define FG 1
#define PX 64

struct TT {
  char done;
  char init;
  FT_Face sans;
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

int main() {
  EGLint cfgc;
  EGLConfig cfgv;
  EGLContext ctx;
  struct wl_display *dpy = wl_display_connect(0);
  EGLDisplay egl;
  FT_Library ft;
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
  eglChooseConfig(egl, (int[]){EGL_ALPHA_SIZE, 1, EGL_NONE}, &cfgv, 1, &cfgc);
  TT.win = wl_egl_window_create(wl, 640, 480);
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
    if (TT.init++ < 2 || !wl_display_dispatch(dpy)) {
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
  eglDestroySurface(egl, win);
  wl_egl_window_destroy(TT.win);
  wl_shell_surface_destroy(sh);
  wl_surface_destroy(wl);
  eglTerminate(egl);
  wl_display_disconnect(dpy);
}
