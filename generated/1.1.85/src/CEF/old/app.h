#ifndef __CEF_APP__H
#define __CEF_APP__H

#include <include/cef_app.h>

class VkCEFApp :
    public CefApp,
    public CefBrowserProcessHandler,
    public CefRenderProcessHandler {

  public:
    VkCEFApp();

    void SetSubprocess(char *_subprocess_path);

  private:

    virtual CefRefPtr<CefBrowserProcessHandler> GetBrowserProcessHandler()
      OVERRIDE { return this; }

    virtual void OnContextInitialized() OVERRIDE;
    virtual void OnBeforeChildProcessLaunch(CefRefPtr<CefCommandLine> command_line) OVERRIDE;
    virtual void OnContextCreated(CefRefPtr<CefBrowser> browser,
                    CefRefPtr<CefFrame> frame,
                    CefRefPtr<CefV8Context> context) OVERRIDE;

    // Registers custom schemes
    virtual void OnRegisterCustomSchemes(CefRefPtr<CefSchemeRegistrar> registrar) OVERRIDE;

    char *subprocess_path;

    IMPLEMENT_REFCOUNTING(VkCEFApp);
};

#endif
