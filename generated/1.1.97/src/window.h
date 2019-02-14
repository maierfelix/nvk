#ifndef __VK_WINDOW_H__
#define __VK_WINDOW_H__

#define NAPI_EXPERIMENTAL
#include <napi.h>

#define GLFW_INCLUDE_VULKAN
#include <GLFW/glfw3.h>

#include "source.h"

class VulkanWindow : public Napi::ObjectWrap<VulkanWindow> {

  public:

    static Napi::Object Initialize(Napi::Env env, Napi::Object exports);
    VulkanWindow(const Napi::CallbackInfo &info);
    ~VulkanWindow();
    static Napi::FunctionReference constructor;

    int width = 480;
    int height = 320;
    std::string title = "undefined";

    double mouseLastX = 0;
    double mouseLastY = 0;

    // event callbacks
    Napi::FunctionReference onresize;
    Napi::FunctionReference onfocus;
    Napi::FunctionReference onclose;
    Napi::FunctionReference onkeydown;
    Napi::FunctionReference onkeyup;
    Napi::FunctionReference onmousemove;
    Napi::FunctionReference onmousewheel;
    Napi::FunctionReference onmousedown;
    Napi::FunctionReference onmouseup;
    Napi::FunctionReference ondrop;

    Napi::Env env_;

    GLFWwindow* instance;

    Napi::Value pollEvents(const Napi::CallbackInfo &info);
    Napi::Value focus(const Napi::CallbackInfo &info);
    Napi::Value close(const Napi::CallbackInfo &info);
    Napi::Value shouldClose(const Napi::CallbackInfo &info);
    Napi::Value createSurface(const Napi::CallbackInfo &info);
    Napi::Value getRequiredInstanceExtensions(const Napi::CallbackInfo &info);

    Napi::Value Gettitle(const Napi::CallbackInfo &info);
    void Settitle(const Napi::CallbackInfo &info, const Napi::Value& value);

    Napi::Value Getwidth(const Napi::CallbackInfo &info);
    void Setwidth(const Napi::CallbackInfo &info, const Napi::Value& value);

    Napi::Value Getheight(const Napi::CallbackInfo &info);
    void Setheight(const Napi::CallbackInfo &info, const Napi::Value& value);

    Napi::Value Getonresize(const Napi::CallbackInfo &info);
    void Setonresize(const Napi::CallbackInfo &info, const Napi::Value& value);

    Napi::Value Getonfocus(const Napi::CallbackInfo &info);
    void Setonfocus(const Napi::CallbackInfo &info, const Napi::Value& value);

    Napi::Value Getonclose(const Napi::CallbackInfo &info);
    void Setonclose(const Napi::CallbackInfo &info, const Napi::Value& value);

    Napi::Value Getonkeydown(const Napi::CallbackInfo &info);
    void Setonkeydown(const Napi::CallbackInfo &info, const Napi::Value& value);

    Napi::Value Getonkeyup(const Napi::CallbackInfo &info);
    void Setonkeyup(const Napi::CallbackInfo &info, const Napi::Value& value);

    Napi::Value Getonmousemove(const Napi::CallbackInfo &info);
    void Setonmousemove(const Napi::CallbackInfo &info, const Napi::Value& value);

    Napi::Value Getonmousewheel(const Napi::CallbackInfo &info);
    void Setonmousewheel(const Napi::CallbackInfo &info, const Napi::Value& value);

    Napi::Value Getonmousedown(const Napi::CallbackInfo &info);
    void Setonmousedown(const Napi::CallbackInfo &info, const Napi::Value& value);

    Napi::Value Getonmouseup(const Napi::CallbackInfo &info);
    void Setonmouseup(const Napi::CallbackInfo &info, const Napi::Value& value);

    Napi::Value Getondrop(const Napi::CallbackInfo &info);
    void Setondrop(const Napi::CallbackInfo &info, const Napi::Value& value);

    static void onWindowResize(GLFWwindow*, int, int);
    static void onWindowFocus(GLFWwindow*, int);
    static void onWindowClose(GLFWwindow*);
    static void onWindowKeyPress(GLFWwindow*, int, int, int, int);
    static void onWindowMouseMove(GLFWwindow*, double, double);
    static void onWindowMouseWheel(GLFWwindow*, double, double);
    static void onWindowMouseButton(GLFWwindow*, int, int, int);
    static void onWindowDrop(GLFWwindow*, int, const char**);

};

Napi::FunctionReference VulkanWindow::constructor;

VulkanWindow::~VulkanWindow() {}

Napi::Object VulkanWindow::Initialize(Napi::Env env, Napi::Object exports) {
  Napi::HandleScope scope(env);

  Napi::Function func = DefineClass(env, "VulkanWindow", {
    // methods
    InstanceMethod(
      "pollEvents",
      &VulkanWindow::pollEvents,
      napi_enumerable
    ),
    InstanceMethod(
      "focus",
      &VulkanWindow::focus,
      napi_enumerable
    ),
    InstanceMethod(
      "close",
      &VulkanWindow::close,
      napi_enumerable
    ),
    InstanceMethod(
      "shouldClose",
      &VulkanWindow::shouldClose,
      napi_enumerable
    ),
    InstanceMethod(
      "createSurface",
      &VulkanWindow::createSurface,
      napi_enumerable
    ),
    InstanceMethod(
      "getRequiredInstanceExtensions",
      &VulkanWindow::getRequiredInstanceExtensions,
      napi_enumerable
    ),
    // accessors
    InstanceAccessor(
      "title",
      &VulkanWindow::Gettitle,
      &VulkanWindow::Settitle,
      napi_enumerable
    ),
    InstanceAccessor(
      "width",
      &VulkanWindow::Getwidth,
      &VulkanWindow::Setwidth,
      napi_enumerable
    ),
    InstanceAccessor(
      "height",
      &VulkanWindow::Getheight,
      &VulkanWindow::Setheight,
      napi_enumerable
    ),
    InstanceAccessor(
      "onresize",
      &VulkanWindow::Getonresize,
      &VulkanWindow::Setonresize,
      napi_enumerable
    ),
    InstanceAccessor(
      "onfocus",
      &VulkanWindow::Getonfocus,
      &VulkanWindow::Setonfocus,
      napi_enumerable
    ),
    InstanceAccessor(
      "onclose",
      &VulkanWindow::Getonclose,
      &VulkanWindow::Setonclose,
      napi_enumerable
    ),
    InstanceAccessor(
      "onkeydown",
      &VulkanWindow::Getonkeydown,
      &VulkanWindow::Setonkeydown,
      napi_enumerable
    ),
    InstanceAccessor(
      "onkeyup",
      &VulkanWindow::Getonkeyup,
      &VulkanWindow::Setonkeyup,
      napi_enumerable
    ),
    InstanceAccessor(
      "onmousemove",
      &VulkanWindow::Getonmousemove,
      &VulkanWindow::Setonmousemove,
      napi_enumerable
    ),
    InstanceAccessor(
      "onmousewheel",
      &VulkanWindow::Getonmousewheel,
      &VulkanWindow::Setonmousewheel,
      napi_enumerable
    ),
    InstanceAccessor(
      "onmousedown",
      &VulkanWindow::Getonmousedown,
      &VulkanWindow::Setonmousedown,
      napi_enumerable
    ),
    InstanceAccessor(
      "onmouseup",
      &VulkanWindow::Getonmouseup,
      &VulkanWindow::Setonmouseup,
      napi_enumerable
    ),
    InstanceAccessor(
      "ondrop",
      &VulkanWindow::Getondrop,
      &VulkanWindow::Setondrop,
      napi_enumerable
    )
  });

  constructor = Napi::Persistent(func);
  constructor.SuppressDestruct();

  exports.Set("VulkanWindow", func);
  return exports;
}

void VulkanWindow::onWindowResize(GLFWwindow* window, int w, int h) {
  VulkanWindow* self = static_cast<VulkanWindow*>(glfwGetWindowUserPointer(window));
  Napi::Env env = self->env_;
  self->width = w;
  self->height = h;
  if (self->onresize.IsEmpty()) return;
  Napi::Object out = Napi::Object::New(env);
  out.Set("width", Napi::Number::New(env, self->width));
  out.Set("height", Napi::Number::New(env, self->height));
  self->onresize.Value().As<Napi::Function>()({ out });
}

void VulkanWindow::onWindowFocus(GLFWwindow* window, int focused) {
  VulkanWindow* self = static_cast<VulkanWindow*>(glfwGetWindowUserPointer(window));
  Napi::Env env = self->env_;
  if (self->onfocus.IsEmpty()) return;
  Napi::Object out = Napi::Object::New(env);
  out.Set("focused", Napi::Boolean::New(env, !!focused));
  self->onfocus.Value().As<Napi::Function>()({ out });
}

void VulkanWindow::onWindowClose(GLFWwindow* window) {
  VulkanWindow* self = static_cast<VulkanWindow*>(glfwGetWindowUserPointer(window));
  Napi::Env env = self->env_;
  if (self->onclose.IsEmpty()) return;
  Napi::Object out = Napi::Object::New(env);
  self->onfocus.Value().As<Napi::Function>()({ out });
}

void VulkanWindow::onWindowKeyPress(GLFWwindow* window, int key, int scancode, int action, int mods) {
  VulkanWindow* self = static_cast<VulkanWindow*>(glfwGetWindowUserPointer(window));
  Napi::Env env = self->env_;
  Napi::Object out = Napi::Object::New(env);
  out.Set("keyCode", Napi::Number::New(env, key));
  // press
  if (action == GLFW_PRESS) {
    if (!(self->onkeydown.IsEmpty())) {
      self->onkeydown.Value().As<Napi::Function>()({ out });
    }
  }
  // release
  else if (action == GLFW_RELEASE) {
    if (!(self->onkeyup.IsEmpty())) {
      self->onkeyup.Value().As<Napi::Function>()({ out });
    }
  }
}

void VulkanWindow::onWindowMouseMove(GLFWwindow* window, double x, double y) {
  VulkanWindow* self = static_cast<VulkanWindow*>(glfwGetWindowUserPointer(window));
  Napi::Env env = self->env_;
  Napi::Object out = Napi::Object::New(env);
  double movementX = self->mouseLastX - x;
  double movementY = self->mouseLastY - y;
  self->mouseLastX = x;
  self->mouseLastY = y;
  if (self->onmousemove.IsEmpty()) return;
  out.Set("x", Napi::Number::New(env, x));
  out.Set("y", Napi::Number::New(env, y));
  out.Set("movementX", Napi::Number::New(env, movementX));
  out.Set("movementY", Napi::Number::New(env, movementY));
  self->onmousemove.Value().As<Napi::Function>()({ out });
}

void VulkanWindow::onWindowMouseWheel(GLFWwindow* window, double deltaX, double deltaY) {
  VulkanWindow* self = static_cast<VulkanWindow*>(glfwGetWindowUserPointer(window));
  Napi::Env env = self->env_;
  if (self->onmousewheel.IsEmpty()) return;
  double mouseX = 0;
  double mouseY = 0;
  glfwGetCursorPos(window, &mouseX, &mouseY);
  Napi::Object out = Napi::Object::New(env);
  out.Set("x", Napi::Number::New(env, mouseX));
  out.Set("y", Napi::Number::New(env, mouseY));
  out.Set("deltaX", Napi::Number::New(env, deltaX));
  out.Set("deltaY", Napi::Number::New(env, deltaY));
  self->onmousewheel.Value().As<Napi::Function>()({ out });
}

void VulkanWindow::onWindowMouseButton(GLFWwindow* window, int button, int action, int mods) {
  VulkanWindow* self = static_cast<VulkanWindow*>(glfwGetWindowUserPointer(window));
  Napi::Env env = self->env_;
  Napi::Object out = Napi::Object::New(env);
  double mouseX = 0;
  double mouseY = 0;
  glfwGetCursorPos(window, &mouseX, &mouseY);
  out.Set("x", Napi::Number::New(env, mouseX));
  out.Set("y", Napi::Number::New(env, mouseY));
  out.Set("button", Napi::Number::New(env, button));
  // press
  if (action == GLFW_PRESS) {
    if (!(self->onmousedown.IsEmpty())) {
      self->onmousedown.Value().As<Napi::Function>()({ out });
    }
  }
  // release
  else if (action == GLFW_RELEASE) {
    if (!(self->onmouseup.IsEmpty())) {
      self->onmouseup.Value().As<Napi::Function>()({ out });
    }
  }
}

void VulkanWindow::onWindowDrop(GLFWwindow* window, int count, const char** paths) {
  VulkanWindow* self = static_cast<VulkanWindow*>(glfwGetWindowUserPointer(window));
  Napi::Env env = self->env_;
  if (self->ondrop.IsEmpty()) return;
  Napi::Object out = Napi::Object::New(env);
  // fill paths
  Napi::Array arr = Napi::Array::New(env, count);
  unsigned int len = count;
  for (unsigned int ii = 0; ii < len; ++ii) {
    arr.Set(ii, Napi::String::New(env, paths[ii]));
  };
  // add to out obj
  out.Set("paths", arr);
  self->ondrop.Value().As<Napi::Function>()({ out });
}

VulkanWindow::VulkanWindow(const Napi::CallbackInfo& info) : Napi::ObjectWrap<VulkanWindow>(info), env_(info.Env()) {
  Napi::Env env = env_;
  if (info.IsConstructCall()) {
    if (info[0].IsObject()) {
      // init glfw
      if (glfwInit() != GLFW_TRUE) Napi::TypeError::New(env, "Failed to initialise GLFW").ThrowAsJavaScriptException();
      Napi::Object obj = info[0].As<Napi::Object>();
      if (!obj.Has("width")) Napi::Error::New(env, "'Object' must contain property 'width'").ThrowAsJavaScriptException();
      if (!obj.Has("height")) Napi::Error::New(env, "'Object' must contain property 'height'").ThrowAsJavaScriptException();
      if (!obj.Has("title")) Napi::Error::New(env, "'Object' must contain property 'title'").ThrowAsJavaScriptException();
      Napi::Value argWidth = obj.Get("width");
      Napi::Value argHeight = obj.Get("height");
      Napi::Value argTitle = obj.Get("title");
      if (argWidth.IsNumber()) this->width = argWidth.As<Napi::Number>().Int32Value();
      if (argHeight.IsNumber()) this->height = argHeight.As<Napi::Number>().Int32Value();
      if (argTitle.IsString()) this->title = argTitle.As<Napi::String>().Utf8Value();
      glfwWindowHint(GLFW_CLIENT_API, GLFW_NO_API);
      glfwWindowHint(GLFW_RESIZABLE, GLFW_TRUE);
      GLFWwindow* window = glfwCreateWindow(this->width, this->height, this->title.c_str(), nullptr, nullptr);
      this->instance = window;
      glfwMakeContextCurrent(window);
      glfwSetWindowUserPointer(window, this);
      // window events
      glfwSetWindowSizeCallback(window, VulkanWindow::onWindowResize);
      glfwSetWindowFocusCallback(window, VulkanWindow::onWindowFocus);
      glfwSetWindowCloseCallback(window, VulkanWindow::onWindowClose);
      // keyboard events
      glfwSetKeyCallback(window, VulkanWindow::onWindowKeyPress);
      // mouse events
      glfwSetCursorPosCallback(window, VulkanWindow::onWindowMouseMove);
      glfwSetScrollCallback(window, VulkanWindow::onWindowMouseWheel);
      glfwSetMouseButtonCallback(window, VulkanWindow::onWindowMouseButton);
      // file drop
      glfwSetDropCallback(window, VulkanWindow::onWindowDrop);
    } else {
      Napi::Error::New(env, "Argument 1 must be of type 'Object'").ThrowAsJavaScriptException();
    }
  } else {
    Napi::Error::New(env, "VulkanWindow constructor cannot be invoked without 'new'").ThrowAsJavaScriptException();
  }
}

Napi::Value VulkanWindow::shouldClose(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  GLFWwindow* window = this->instance;
  return Napi::Boolean::New(env, static_cast<bool>(glfwWindowShouldClose(window)));
}

Napi::Value VulkanWindow::focus(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  GLFWwindow* window = this->instance;
  glfwFocusWindow(window);
  return env.Undefined();
}

Napi::Value VulkanWindow::close(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  GLFWwindow* window = this->instance;
  glfwSetWindowShouldClose(window, GLFW_TRUE);
  VulkanWindow::onWindowClose(window);
  return env.Undefined();
}

Napi::Value VulkanWindow::pollEvents(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  GLFWwindow* window = this->instance;
  if (!glfwWindowShouldClose(window)) glfwPollEvents();
  return env.Undefined();
}

Napi::Value VulkanWindow::createSurface(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::Object arg0;
  Napi::Object arg1;
  Napi::Object arg2;
  if (info[0].IsObject()) arg0 = info[0].As<Napi::Object>();
  else Napi::TypeError::New(env, "Argument 1 must be of type 'VkInstance'").ThrowAsJavaScriptException();
  if (info[2].IsObject()) arg2 = info[2].As<Napi::Object>();
  else Napi::TypeError::New(env, "Argument 2 must be of type 'VkSurfaceKHR'").ThrowAsJavaScriptException();

  _VkInstance* instance = Napi::ObjectWrap<_VkInstance>::Unwrap(arg0);
  _VkSurfaceKHR* surface = Napi::ObjectWrap<_VkSurfaceKHR>::Unwrap(arg2);

  VkResult out = glfwCreateWindowSurface(
    instance->instance,
    this->instance,
    nullptr,
    &surface->instance
  );
  return Napi::Number::New(env, static_cast<int32_t>(out));
  return Napi::Number::New(env, static_cast<int32_t>(0));
}

Napi::Value VulkanWindow::getRequiredInstanceExtensions(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  uint32_t glfwExtensionCount = 0;
  const char** glfwExtensions = glfwGetRequiredInstanceExtensions(&glfwExtensionCount);
  Napi::Array out = Napi::Array::New(env, glfwExtensionCount);
  for (unsigned int ii = 0; ii < glfwExtensionCount; ++ii) {
    out.Set(ii, Napi::String::New(env, glfwExtensions[ii]));
  };
  return out;
}

// title
Napi::Value VulkanWindow::Gettitle(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::String str = Napi::String::New(env, this->title.c_str());
  return str;
}
void VulkanWindow::Settitle(const Napi::CallbackInfo& info, const Napi::Value& value) {
  Napi::Env env = info.Env();
  if (!value.IsString()) {
    Napi::TypeError::New(env, "Argument 1 must be of type 'String'").ThrowAsJavaScriptException();
  }
  std::string title = value.ToString().Utf8Value();
  glfwSetWindowTitle(this->instance, title.c_str());
  this->title = title;
}

// width
Napi::Value VulkanWindow::Getwidth(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  return Napi::Number::New(env, static_cast<int32_t>(this->width));
}
void VulkanWindow::Setwidth(const Napi::CallbackInfo& info, const Napi::Value& value) {
  Napi::Env env = info.Env();
  GLFWwindow* window = this->instance;
  if (!value.IsNumber()) {
    Napi::TypeError::New(env, "Argument 1 must be of type 'Number'").ThrowAsJavaScriptException();
  }
  this->width = value.As<Napi::Number>().Int32Value();
  glfwSetWindowSize(window, this->width, this->height);
  VulkanWindow::onWindowResize(window, this->width, this->height);
}

// height
Napi::Value VulkanWindow::Getheight(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  return Napi::Number::New(env, static_cast<int32_t>(this->height));
}
void VulkanWindow::Setheight(const Napi::CallbackInfo& info, const Napi::Value& value) {
  Napi::Env env = info.Env();
  GLFWwindow* window = this->instance;
  if (!value.IsNumber()) {
    Napi::TypeError::New(env, "Argument 1 must be of type 'Number'").ThrowAsJavaScriptException();
  }
  this->height = value.As<Napi::Number>().Int32Value();
  glfwSetWindowSize(window, this->width, this->height);
  VulkanWindow::onWindowResize(window, this->width, this->height);
}

// onresize
Napi::Value VulkanWindow::Getonresize(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (this->onresize.IsEmpty()) return env.Null();
  return this->onresize.Value().As<Napi::Function>();
}
void VulkanWindow::Setonresize(const Napi::CallbackInfo& info, const Napi::Value& value) {
  Napi::Env env = info.Env();
  if (value.IsFunction()) this->onresize.Reset(value.As<Napi::Function>(), 1);
  else if (value.IsNull()) this->onresize.Reset();
  else Napi::TypeError::New(env, "Argument 1 must be of type 'Function'").ThrowAsJavaScriptException();
}

// onfocus
Napi::Value VulkanWindow::Getonfocus(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (this->onfocus.IsEmpty()) return env.Null();
  return this->onfocus.Value().As<Napi::Function>();
}
void VulkanWindow::Setonfocus(const Napi::CallbackInfo& info, const Napi::Value& value) {
  Napi::Env env = info.Env();
  if (value.IsFunction()) this->onfocus.Reset(value.As<Napi::Function>(), 1);
  else if (value.IsNull()) this->onfocus.Reset();
  else Napi::TypeError::New(env, "Argument 1 must be of type 'Function'").ThrowAsJavaScriptException();
}

// onclose
Napi::Value VulkanWindow::Getonclose(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (this->onclose.IsEmpty()) return env.Null();
  return this->onclose.Value().As<Napi::Function>();
}
void VulkanWindow::Setonclose(const Napi::CallbackInfo& info, const Napi::Value& value) {
  Napi::Env env = info.Env();
  if (value.IsFunction()) this->onclose.Reset(value.As<Napi::Function>(), 1);
  else if (value.IsNull()) this->onclose.Reset();
  else Napi::TypeError::New(env, "Argument 1 must be of type 'Function'").ThrowAsJavaScriptException();
}

// onkeydown
Napi::Value VulkanWindow::Getonkeydown(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (this->onkeydown.IsEmpty()) return env.Null();
  return this->onkeydown.Value().As<Napi::Function>();
}
void VulkanWindow::Setonkeydown(const Napi::CallbackInfo& info, const Napi::Value& value) {
  Napi::Env env = info.Env();
  if (value.IsFunction()) this->onkeydown.Reset(value.As<Napi::Function>(), 1);
  else if (value.IsNull()) this->onkeydown.Reset();
  else Napi::TypeError::New(env, "Argument 1 must be of type 'Function'").ThrowAsJavaScriptException();
}

// onkeyup
Napi::Value VulkanWindow::Getonkeyup(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (this->onkeyup.IsEmpty()) return env.Null();
  return this->onkeyup.Value().As<Napi::Function>();
}
void VulkanWindow::Setonkeyup(const Napi::CallbackInfo& info, const Napi::Value& value) {
  Napi::Env env = info.Env();
  if (value.IsFunction()) this->onkeyup.Reset(value.As<Napi::Function>(), 1);
  else if (value.IsNull()) this->onkeyup.Reset();
  else Napi::TypeError::New(env, "Argument 1 must be of type 'Function'").ThrowAsJavaScriptException();
}

// onmousemove
Napi::Value VulkanWindow::Getonmousemove(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (this->onmousemove.IsEmpty()) return env.Null();
  return this->onmousemove.Value().As<Napi::Function>();
}
void VulkanWindow::Setonmousemove(const Napi::CallbackInfo& info, const Napi::Value& value) {
  Napi::Env env = info.Env();
  if (value.IsFunction()) this->onmousemove.Reset(value.As<Napi::Function>(), 1);
  else if (value.IsNull()) this->onmousemove.Reset();
  else Napi::TypeError::New(env, "Argument 1 must be of type 'Function'").ThrowAsJavaScriptException();
}

// onmousewheel
Napi::Value VulkanWindow::Getonmousewheel(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (this->onmousewheel.IsEmpty()) return env.Null();
  return this->onmousewheel.Value().As<Napi::Function>();
}
void VulkanWindow::Setonmousewheel(const Napi::CallbackInfo& info, const Napi::Value& value) {
  Napi::Env env = info.Env();
  if (value.IsFunction()) this->onmousewheel.Reset(value.As<Napi::Function>(), 1);
  else if (value.IsNull()) this->onmousewheel.Reset();
  else Napi::TypeError::New(env, "Argument 1 must be of type 'Function'").ThrowAsJavaScriptException();
}

// onmousedown
Napi::Value VulkanWindow::Getonmousedown(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (this->onmousedown.IsEmpty()) return env.Null();
  return this->onmousedown.Value().As<Napi::Function>();
}
void VulkanWindow::Setonmousedown(const Napi::CallbackInfo& info, const Napi::Value& value) {
  Napi::Env env = info.Env();
  if (value.IsFunction()) this->onmousedown.Reset(value.As<Napi::Function>(), 1);
  else if (value.IsNull()) this->onmousedown.Reset();
  else Napi::TypeError::New(env, "Argument 1 must be of type 'Function'").ThrowAsJavaScriptException();
}

// onmouseup
Napi::Value VulkanWindow::Getonmouseup(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (this->onmouseup.IsEmpty()) return env.Null();
  return this->onmouseup.Value().As<Napi::Function>();
}
void VulkanWindow::Setonmouseup(const Napi::CallbackInfo& info, const Napi::Value& value) {
  Napi::Env env = info.Env();
  if (value.IsFunction()) this->onmouseup.Reset(value.As<Napi::Function>(), 1);
  else if (value.IsNull()) this->onmouseup.Reset();
  else Napi::TypeError::New(env, "Argument 1 must be of type 'Function'").ThrowAsJavaScriptException();
}

// ondrop
Napi::Value VulkanWindow::Getondrop(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (this->ondrop.IsEmpty()) return env.Null();
  return this->ondrop.Value().As<Napi::Function>();
}
void VulkanWindow::Setondrop(const Napi::CallbackInfo& info, const Napi::Value& value) {
  Napi::Env env = info.Env();
  if (value.IsFunction()) this->ondrop.Reset(value.As<Napi::Function>(), 1);
  else if (value.IsNull()) this->ondrop.Reset();
  else Napi::TypeError::New(env, "Argument 1 must be of type 'Function'").ThrowAsJavaScriptException();
}

#endif
