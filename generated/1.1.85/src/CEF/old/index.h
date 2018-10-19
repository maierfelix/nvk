#ifndef __CEF_INDEX__H 
#define __CEF_INDEX__H

#include <nan.h>
#include "uv.h"
#include <include/cef_v8.h>
#include <include/cef_callback.h>

#define ASSERT(condition) ((void)0)
#define REQUIRE_UI_THREAD()   ASSERT(CefCurrentlyOn(TID_UI));
#define REQUIRE_IO_THREAD()   ASSERT(CefCurrentlyOn(TID_IO));

namespace Barbarian {

#define BARBARIAN_DEFINE_CONSTANT(target, name, constant)         \
  (target)->Set(v8::String::NewSymbol(name),              \
  v8::Integer::New(constant),                     \
  static_cast<v8::PropertyAttribute>(v8::ReadOnly|v8::DontDelete))

  struct NodeCallback {
    v8::Persistent<v8::Object> Holder;
    v8::Persistent<v8::Function> cb;

    ~NodeCallback() {
      Holder.Dispose();
      cb.Dispose();
    }
  };

  // Event message
  typedef enum {
    BB_EVENT_WINDOW_CREATED,
    BB_EVENT_REQUEST
  } BBEvent;

  struct BBEventMessage {
    BBEvent event;
    CefRefPtr<CefBrowser> browser;
    CefRefPtr<CefFrame> frame;
    CefRefPtr<CefRequest> request;
    CefRefPtr<CefCallback> callback;

    void *userdata;
  };

  // Event handlers
  extern NodeCallback *internal_request_handler;

  void InternalEventHandler(uv_async_t *handle, int status);
}

#endif