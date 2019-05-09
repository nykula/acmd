#include <EGL/egl.h>
#include <GLES2/gl2.h>
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

static void letter(FT_Bitmap *bmp, int x, int y) {
  int i, j, p, q;
  unsigned char buf;

  glEnable(GL_SCISSOR_TEST);
  for (i = x, p = 0; i < x + bmp->width; i++, p++)
    for (j = y, q = 0; j < y + bmp->rows; j++, q++)
      if (!(i < 0 || j < 0 || i >= 640 || j >= 480))
        if ((buf = bmp->buffer[q * bmp->width + p])) {
          glScissor(i, 480 - j, 1, 1);
          glClearColor(0.0 + FG * buf / 255.0, 0.6 + FG * buf / 255.0,
                       0.8 + FG * buf / 255.0, 1);
          glClear(GL_COLOR_BUFFER_BIT);
        }
  glDisable(GL_SCISSOR_TEST);
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
  FT_Face face;
  FT_Library ft;
  FT_Vector pen;
  struct wl_shell_surface *sh;
  FT_GlyphSlot slot;
  char *txt;
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
              &face);
  FT_Set_Char_Size(face, 14 * PX, 0, 0, 0);
  slot = face->glyph;
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
      pen.x = 0, pen.y = (480 - 200) * PX;
      for (txt = "FreeType2"; *txt;) {
        FT_Set_Transform(face, 0, &pen);
        FT_Load_Char(face, *txt++, FT_LOAD_RENDER);
        letter(&slot->bitmap, slot->bitmap_left, 480 - slot->bitmap_top);
        pen.x += slot->advance.x, pen.y += slot->advance.y;
      }
      eglSwapBuffers(egl, win);
      puts("HERE");
    }
  while (!TT.done);
  FT_Done_Face(face);
  FT_Done_FreeType(ft);
  eglDestroyContext(egl, ctx);
  eglDestroySurface(egl, win);
  wl_egl_window_destroy(TT.win);
  wl_shell_surface_destroy(sh);
  wl_surface_destroy(wl);
  eglTerminate(egl);
  wl_display_disconnect(dpy);
}
