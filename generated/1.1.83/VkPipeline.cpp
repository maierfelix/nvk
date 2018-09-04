#include "utils.h"
#include "VkPipeline.h"

Nan::Persistent<v8::FunctionTemplate> _VkPipeline::constructor;

_VkPipeline::_VkPipeline() {
  instance = (VkPipeline*) malloc(sizeof(VkPipeline));
}

_VkPipeline::~_VkPipeline() { }

void _VkPipeline::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // Constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkPipeline::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkPipeline").ToLocalChecked());

  // Prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();

  Nan::Set(target, Nan::New("VkPipeline").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(_VkPipeline::New) {
  _VkPipeline* self = new _VkPipeline();
  self->Wrap(info.Holder());
  info.GetReturnValue().Set(info.Holder());
};
