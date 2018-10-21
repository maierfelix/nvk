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
  glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_BGRA, GL_UNSIGNED_INT_8_8_8_8_REV, nullptr);
  glBindTexture(GL_TEXTURE_2D, 0);
  initialized = true;
  actualWidth = width;
  actualHeight = height;
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

  int oldWidth = currentWidth;
  int oldHeight = currentHeight;

  currentWidth = width;
  currentHeight = height;

  glPixelStorei(GL_UNPACK_ROW_LENGTH, currentWidth);

  // full
  if (oldWidth != currentWidth || oldHeight != currentHeight) {
    glPixelStorei(GL_UNPACK_SKIP_PIXELS, 0);
    glPixelStorei(GL_UNPACK_SKIP_ROWS, 0);
    glTexImage2D(
      GL_TEXTURE_2D, 0,
      GL_RGBA,
      currentWidth, currentHeight,
      0,
      GL_BGRA, GL_UNSIGNED_INT_8_8_8_8_REV,
      buffer
    );
    printf("FULL RECT\n");
  // partial
  } else {
    CefRenderHandler::RectList::const_iterator i = dirtyRects.begin();
    for (; i != dirtyRects.end(); ++i) {
      const CefRect& rect = *i;
      glPixelStorei(GL_UNPACK_SKIP_PIXELS, rect.x);
      glPixelStorei(GL_UNPACK_SKIP_ROWS, rect.y);
      glTexSubImage2D(
        GL_TEXTURE_2D, 0,
        rect.x, rect.y,
        rect.width, rect.height,
        GL_BGRA, GL_UNSIGNED_INT_8_8_8_8_REV,
        buffer
      );
      printf("PARTIAL RECT x:%i y:%i w:%i h:%i t:%i\n", rect.x, rect.y, rect.width, rect.height, rect.width * rect.height);
    };
  }

  glBindTexture(GL_TEXTURE_2D, 0);
}

/*void RenderHandler::OnAcceleratedPaint(
  CefRefPtr<CefBrowser> browser,
  PaintElementType type,
  const RectList &dirtyRects,
  void *shared_handle
) {
  if (shared_handle != last_handle) {
    printf("CHANGED!\n");
    last_handle = shared_handle;
  }
  printf("ACC PAINT!\n");
}*/

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
