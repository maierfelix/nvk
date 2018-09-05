#include "utils.h"
#include "VkDisplayKHR.h"

Nan::Persistent<v8::FunctionTemplate> _VkDisplayKHR::constructor;

_VkDisplayKHR::_VkDisplayKHR() {
  instance = (VkDisplayKHR*) malloc(sizeof(VkDisplayKHR));
}

_VkDisplayKHR::~_VkDisplayKHR() { }

void _VkDisplayKHR::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // Constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkDisplayKHR::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkDisplayKHR").ToLocalChecked());

  // Prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();

  Nan::Set(target, Nan::New("VkDisplayKHR").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(_VkDisplayKHR::New) {
  _VkDisplayKHR* self = new _VkDisplayKHR();
  self->Wrap(info.Holder());
  info.GetReturnValue().Set(info.Holder());
};
