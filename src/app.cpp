#include <include/cef_cookie.h>
#include <include/cef_process_message.h>
#include <include/cef_task.h>
#include <include/cef_v8.h>

#include "app.h"

VkCEFApp::VkCEFApp(){ }

void VkCEFApp::SetSubprocess(char *_subprocess_path)
{
  subprocess_path = _subprocess_path;
}

void VkCEFApp::OnContextInitialized()
{

}

void VkCEFApp::OnBeforeChildProcessLaunch(CefRefPtr<CefCommandLine> command_line)
{
  command_line->SetProgram(CefString(subprocess_path));
}

void VkCEFApp::OnContextCreated(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, CefRefPtr<CefV8Context> context)
{
  CefRefPtr<CefV8Value> object = context->GetGlobal();
}

void VkCEFApp::OnBeforeCommandLineProcessing(const CefString& /*process_type*/, CefRefPtr<CefCommandLine> command_line)
{
  //command_line->AppendSwitch("disable-gpu");
}
