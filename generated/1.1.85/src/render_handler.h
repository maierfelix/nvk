#ifndef __VK_RENDER_HANDLER_H__
#define __VK_RENDER_HANDLER_H__

#include <GLEW/glew.h>
#include <GLFW/glfw3.h>

#include <include/cef_render_handler.h>

class RenderHandler : public CefRenderHandler {
  public:
    RenderHandler();

    bool initialized;

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

    GLuint tex_;

  private:
    int width_;
    int height_;

    IMPLEMENT_REFCOUNTING(RenderHandler);

};

#endif
