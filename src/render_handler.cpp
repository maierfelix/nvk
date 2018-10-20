#include "render_handler.h"

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
  glBindTexture(GL_TEXTURE_2D, 0);
}

void RenderHandler::OnCursorChange(
  CefRefPtr<CefBrowser> browser,
  CefCursorHandle cursor,
  CefRenderHandler::CursorType type,
  const CefCursorInfo& custom_cursor_info
) {
  int target = GLFW_ARROW_CURSOR;
  switch (type) {
    case CursorType::CT_IBEAM:       target = GLFW_IBEAM_CURSOR;     break;
    case CursorType::CT_CROSS:       target = GLFW_CROSSHAIR_CURSOR; break;
    case CursorType::CT_HAND:        target = GLFW_HAND_CURSOR;      break;
    case CursorType::CT_SOUTHRESIZE: target = GLFW_VRESIZE_CURSOR;   break;
    case CursorType::CT_NORTHRESIZE: target = GLFW_VRESIZE_CURSOR;   break;
    case CursorType::CT_EASTRESIZE:  target = GLFW_HRESIZE_CURSOR;   break;
    case CursorType::CT_WESTRESIZE:  target = GLFW_HRESIZE_CURSOR;   break;
  };
  {
    GLFWcursor* cursor = glfwCreateStandardCursor(target);
    glfwSetCursor(window, cursor);
  }
}
