#include <ft2build.h>
#include FT_FREETYPE_H

unsigned char img[480][640];

void draw(FT_Bitmap *bmp, int x, int y) {
  int i, j, p, q;

  for (i = x, p = 0; i < x + bmp->width; i++, p++)
    for (j = y, q = 0; j < y + bmp->rows; j++, q++)
      if (!(i < 0 || j < 0 || i >= 640 || j >= 480))
        img[j][i] |= bmp->buffer[q * bmp->width + p];
}

void put(void) {
  int i, j;

  for (i = 0; i < 480; i++) {
    for (j = 0; j < 640; j++)
      putchar(img[i][j] == 0 ? ' ' : img[i][j] < 128 ? '+' : '*');
    putchar('\n');
  }
}

int main(int argc, char **argv) {
  if (argc != 3) {
    fprintf(stderr, "usage: %s font sample-text\n", *argv);
    return 1;
  }

  FT_Face face;
  FT_Library ft;
  FT_Vector pen;
  FT_GlyphSlot slot;
  char *txt = argv[2];

  FT_Init_FreeType(&ft), FT_New_Face(ft, argv[1], 0, &face);
  FT_Set_Char_Size(face, 50 /*pt*/ * 64, 0, 100 /*dpi*/, 0);
  slot = face->glyph;

  pen.x = 300 /*px*/ * 64, pen.y = (480 - 200 /*px*/) * 64;
  while (*txt) {
    FT_Set_Transform(face, 0, &pen);
    FT_Load_Char(face, *txt++, FT_LOAD_RENDER);
    draw(&slot->bitmap, slot->bitmap_left, 480 - slot->bitmap_top);
    pen.x += slot->advance.x, pen.y += slot->advance.y;
  }

  put();
  FT_Done_Face(face), FT_Done_FreeType(ft);
  return 0;
}
