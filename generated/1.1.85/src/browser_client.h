#include <include/cef_client.h>

#include "render_handler.h"

#ifndef BROWSER_CLIENT_H
#define BROWSER_CLIENT_H

class BrowserClient : public CefClient {
  public:
    BrowserClient(RenderHandler*);

    virtual CefRefPtr<CefRenderHandler> GetRenderHandler();

  private:
    CefRefPtr<CefRenderHandler> handler;

    IMPLEMENT_REFCOUNTING(BrowserClient);

};

#endif
