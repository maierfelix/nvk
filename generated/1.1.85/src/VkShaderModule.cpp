/*
 * MACHINE GENERATED, DO NOT EDIT
 * GENERATED BY node-vulkan v0.0.5
 */
#include "VkShaderModule.h"

Nan::Persistent<v8::FunctionTemplate> _VkShaderModule::constructor;

_VkShaderModule::_VkShaderModule() {}
_VkShaderModule::~_VkShaderModule() {}

void _VkShaderModule::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // Constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkShaderModule::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkShaderModule").ToLocalChecked());

  // Prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();

  Nan::Set(target, Nan::New("VkShaderModule").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(_VkShaderModule::New) {
  _VkShaderModule* self = new _VkShaderModule();
  self->Wrap(info.Holder());
  info.GetReturnValue().Set(info.Holder());
};
