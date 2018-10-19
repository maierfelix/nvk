#include <nan.h>

#include <include/cef_cookie.h>
#include <include/cef_process_message.h>
#include <include/cef_task.h>
#include <include/cef_v8.h>

#include "index.h"
#include "client.h"

const char internalURLPrefix[] = "barbarian://";

VkCEFClient::VkCEFClient() {}

void VkCEFClient::OnAfterCreated(CefRefPtr<CefBrowser> browser)
{
  m_browser = browser;

  // Preparing event message to JavaScript environment
  BBEventMessage *message = new BBEventMessage();
  message->event = BB_EVENT_WINDOW_CREATED;
  message->browser = browser;
  message->userdata = (void *)this;

  uv_async_t *async = new uv_async_t;
  async->data = (void *)message;
  uv_async_init(uv_default_loop(), async, InternalEventHandler);
  uv_async_send(async);
}

void VkCEFClient::OnLoadStart(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame)
{
  REQUIRE_UI_THREAD();
}

void VkCEFClient::OnTitleChange(CefRefPtr<CefBrowser> browser, const CefString& title)
{
  REQUIRE_UI_THREAD();

  GtkWidget* window = gtk_widget_get_ancestor(
    GTK_WIDGET(browser->GetHost()->GetWindowHandle()),
    GTK_TYPE_WINDOW);

  std::string titleStr(title);

  gtk_window_set_title(GTK_WINDOW(window), titleStr.c_str());
}

CefRefPtr<CefResourceHandler> VkCEFClient::GetResourceHandler(
                  CefRefPtr<CefBrowser> browser,
                  CefRefPtr<CefFrame> frame,
                  CefRefPtr<CefRequest> request)
{
  REQUIRE_UI_THREAD();
  std::string url = request->GetURL();

  if (url.find(internalURLPrefix) == 0) {

    if (internal_request_handler == NULL)
      return NULL;
  }

  return NULL;
}

bool VkCEFClient::OnBeforeResourceLoad(
            CefRefPtr<CefBrowser> browser,
            CefRefPtr<CefFrame> frame,
            CefRefPtr<CefRequest> request)
{
  REQUIRE_UI_THREAD();
//    HandleScope scope;
  std::string url = request->GetURL();
//    printf("======= %s\n", url.c_str());

  if (internal_request_handler == NULL)
    return false;

  return false;
}

void VkCEFClient::OnProtocolExecution(
  CefRefPtr<CefBrowser> browser,
  const CefString &url,
  bool &allow_os_execution
) {

}

void VkCEFClient::OnLoadError(CefRefPtr<CefBrowser> browser,
                CefRefPtr<CefFrame> frame,
                ErrorCode errorCode,
                const CefString& errorText,
                const CefString& failedUrl)
{
  if (errorCode == ERR_UNKNOWN_URL_SCHEME) {
    return;
  }
}
