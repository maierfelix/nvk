/*
 * MACHINE GENERATED, DO NOT EDIT
 * GENERATED BY node-vulkan v0.0.5
 */
#include "VkDescriptorUpdateTemplate.h"

Nan::Persistent<v8::FunctionTemplate> _VkDescriptorUpdateTemplate::constructor;

_VkDescriptorUpdateTemplate::_VkDescriptorUpdateTemplate() {}
_VkDescriptorUpdateTemplate::~_VkDescriptorUpdateTemplate() {}

void _VkDescriptorUpdateTemplate::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // Constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkDescriptorUpdateTemplate::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkDescriptorUpdateTemplate").ToLocalChecked());

  // Prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();

  Nan::Set(target, Nan::New("VkDescriptorUpdateTemplate").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(_VkDescriptorUpdateTemplate::New) {
  _VkDescriptorUpdateTemplate* self = new _VkDescriptorUpdateTemplate();
  self->Wrap(info.Holder());
  info.GetReturnValue().Set(info.Holder());
};
