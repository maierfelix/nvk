#include <include/cef_app.h>
#include <include/cef_client.h>
#include <include/cef_browser.h>
#include <include/cef_render_handler.h>

int main(int argc, char *argv[]) {
  CefMainArgs args(GetModuleHandle(NULL));

  {
    int result = CefExecuteProcess(args, nullptr, nullptr);
    // checkout CefApp, derive it and set it as second parameter, for more control on
    // command args and resources.
    if (result >= 0) // child proccess has endend, so exit.
    {
      return result;
    }
    else if (result == -1)
    {
      // we are here in the father proccess.
    }
  }

  return 0;
};
