#include "browser_client.h"

BrowserClient::BrowserClient(RenderHandler* renderHandler)
{
  handler = renderHandler;
}

CefRefPtr<CefRenderHandler> BrowserClient::GetRenderHandler() {
  return handler;
};
