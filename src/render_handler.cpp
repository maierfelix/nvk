#include "render_handler.h"

inline int POT(int x) {
  int p = 1;
  while (p < x) p *= 2;
  return p;
};

RenderHandler::RenderHandler()
{
  initialized = false;
}

void RenderHandler::init(int width, int height)
{
  glGenTextures(1, &tex_);
  glBindTexture(GL_TEXTURE_2D, tex_);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
  glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, nullptr);
  glBindTexture(GL_TEXTURE_2D, 0);
  initialized = true;
}

void RenderHandler::draw(void)
{

}

void RenderHandler::reshape(int w, int h)
{
  width_ = w;
  height_ = h;
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
  glBindTexture(GL_TEXTURE_2D, tex_);
  glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, POT(width), POT(height), 0, GL_BGRA_EXT, GL_UNSIGNED_BYTE, (unsigned char*)buffer);
  glBindTexture(GL_TEXTURE_2D, 0);
}
