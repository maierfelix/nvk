#ifndef __CEF_SCHEME__H
#define __CEF_SCHEME__H

#include <include/cef_resource_handler.h>
#include <include/cef_response.h>
#include <include/cef_scheme.h>

class VkCEFScheme : public CefResourceHandler {

  public:
    VkCEFScheme();

    // CefResourceHandler Methods
    virtual bool ProcessRequest(CefRefPtr<CefRequest> request, CefRefPtr<CefCallback> callback) OVERRIDE;
    virtual void Cancel() OVERRIDE {
      REQUIRE_IO_THREAD();
    }

    virtual void GetResponseHeaders(CefRefPtr<CefResponse> response,
                    int64& response_length,
                    CefString& redirectUrl) OVERRIDE;

    virtual bool ReadResponse(void* data_out,
                  int bytes_to_read,
                  int& bytes_read,
                  CefRefPtr<CefCallback> callback) OVERRIDE;

    void SetContent(std::string data);
    void SetMIMEType(std::string mime_type);
    void SetStatus(int status);

  private:
    int status_;
    std::string data_;
    std::string mime_type_;
    size_t offset_;

    IMPLEMENT_REFCOUNTING(VkCEFScheme);
    IMPLEMENT_LOCKING(VkCEFScheme);
};

class BBSchemeHandlerFactory : public CefSchemeHandlerFactory {
  public:

    virtual CefRefPtr<CefResourceHandler> Create(CefRefPtr<CefBrowser> browser,
                            CefRefPtr<CefFrame> frame,
                            const CefString& scheme_name,
                            CefRefPtr<CefRequest> request) OVERRIDE {
      REQUIRE_IO_THREAD();

      return new VkCEFScheme();
    }
 
     IMPLEMENT_REFCOUNTING(BBSchemeHandlerFactory);
};

#endif
