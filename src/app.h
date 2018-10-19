#ifndef __CEF_APP__H
#define __CEF_APP__H

#include <include/cef_app.h>

class VkCEFApp :
    public CefApp,
    public CefBrowserProcessHandler,
    public CefRenderProcessHandler {

  public:
    VkCEFApp();

    CefRefPtr<CefBrowser> currentBrowser;

    void SetSubprocess(char *_subprocess_path);

    virtual CefRefPtr<CefBrowserProcessHandler> GetBrowserProcessHandler() override { return this; }
    virtual CefRefPtr<CefRenderProcessHandler> GetRenderProcessHandler() override { return this; }

  private:

    virtual void OnContextInitialized() override;
    virtual void OnBeforeChildProcessLaunch(CefRefPtr<CefCommandLine> command_line) override;
    virtual void OnContextCreated(
        CefRefPtr<CefBrowser> browser,
        CefRefPtr<CefFrame> frame,
        CefRefPtr<CefV8Context> context
    ) OVERRIDE;

    virtual void OnBeforeCommandLineProcessing(const CefString& process_type, CefRefPtr<CefCommandLine> command_line) override;

    char *subprocess_path;

    IMPLEMENT_REFCOUNTING(VkCEFApp);
};

#endif
