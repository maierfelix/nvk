#include "render_handler.h"

static int clz(int32_t x) {
  if (!x) return 32;
  int e = 31;
  if (x & 0xFFFF0000) { e -= 16; x >>= 16; }
  if (x & 0x0000FF00) { e -= 8;  x >>= 8;  }
  if (x & 0x000000F0) { e -= 4;  x >>= 4;  }
  if (x & 0x0000000C) { e -= 2;  x >>= 2;  }
  if (x & 0x00000002) { e -= 1; }
  return e;
};

RenderHandler::RenderHandler()
{
  initialized = false;
}

void RenderHandler::init(int width, int height)
{
  glGenTextures(1, &tex_);
  glBindTexture(GL_TEXTURE_2D, tex_);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
  glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, nullptr);
  glBindTexture(GL_TEXTURE_2D, 0);
  initialized = true;
}

void RenderHandler::draw(void)
{

}

void RenderHandler::reshape(int width, int height)
{
  width_ = width;
  height_ = height;
}

bool RenderHandler::GetViewRect(CefRefPtr<CefBrowser> browser, CefRect &rect)
{
  rect = CefRect(0, 0, width_, height_);
  return true;
}

void RenderHandler::OnPaint(
  CefRefPtr<CefBrowser> browser,
  PaintElementType type,
  const RectList &dirtyRects,
  const void* buffer,
  int width,
  int height
) {
  int potw = 1 << (31 - clz(width));
  int poth = 1 << (31 - clz(height));
  if (potw < width) potw <<= 1;
  if (poth < height) poth <<= 1;
  printf("PAINT w:%i h:%i\n", potw, poth);
  glBindTexture(GL_TEXTURE_2D, tex_);
  //glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
  //glPixelStorei(GL_UNPACK_ROW_LENGTH, width);
  glTexImage2D(
    GL_TEXTURE_2D,
    0,
    GL_RGBA,
    width, height,
    0,
    GL_BGRA_EXT,
    GL_UNSIGNED_BYTE,
    (unsigned char*)buffer
  );
  /*for (auto& rect : dirtyRects) {
    printf("x: %i y: %i w: %i h: %i\n", rect.x, rect.y, rect.width, rect.height);
    glTexSubImage2D(
      GL_TEXTURE_2D,
      0,
      rect.x, rect.y,
      rect.width, rect.height,
      GL_RGBA,
      GL_UNSIGNED_BYTE,
      buffer
    );
  };*/
  printf("-------\n");
  glBindTexture(GL_TEXTURE_2D, 0);
}
