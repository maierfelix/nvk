#include "utils.h"
#include "VkObjectTableNVX.h"

Nan::Persistent<v8::FunctionTemplate> _VkObjectTableNVX::constructor;

_VkObjectTableNVX::_VkObjectTableNVX() {
  instance = (VkObjectTableNVX*) malloc(sizeof(VkObjectTableNVX));
}

_VkObjectTableNVX::~_VkObjectTableNVX() { }

void _VkObjectTableNVX::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // Constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkObjectTableNVX::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkObjectTableNVX").ToLocalChecked());

  // Prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();

  Nan::Set(target, Nan::New("VkObjectTableNVX").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(_VkObjectTableNVX::New) {
  _VkObjectTableNVX* self = new _VkObjectTableNVX();
  self->Wrap(info.Holder());
  info.GetReturnValue().Set(info.Holder());
};
