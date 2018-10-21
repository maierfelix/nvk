#ifndef __VK_RENDER_HANDLER_H__
#define __VK_RENDER_HANDLER_H__

#include <GLEW/glew.h>
#include <GLFW/glfw3.h>

#include <include/cef_render_handler.h>

class RenderHandler : public CefRenderHandler {
  public:
    RenderHandler();

    bool initialized;

    int actualWidth;
    int actualHeight;

    int currentWidth;
    int currentHeight;

    void init(int, int);
    void draw(void);
    void reshape(int, int);

    bool GetViewRect(CefRefPtr<CefBrowser>, CefRect&) override;

    void OnPaint(
      CefRefPtr<CefBrowser>,
      PaintElementType,
      const RectList&,
      const void*,
      int,
      int
    ) override;

    void OnCursorChange(
      CefRefPtr<CefBrowser>,
      CefCursorHandle,
      CefRenderHandler::CursorType,
      const CefCursorInfo&
    ) override;

    /*void RenderHandler::OnAcceleratedPaint(
      CefRefPtr<CefBrowser>,
      PaintElementType,
      const RectList&,
      void *shared_handle
    ) override;*/

    GLFWwindow* window;

    GLuint tex_;

    void *last_handle = INVALID_HANDLE_VALUE;

  private:
    int width_;
    int height_;

    IMPLEMENT_REFCOUNTING(RenderHandler);

};

#endif
