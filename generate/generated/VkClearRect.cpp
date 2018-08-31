#include "utils.h"
#include "index.h"
#include "VkClearRect.h"

Nan::Persistent<v8::FunctionTemplate> _VkClearRect::constructor;

_VkClearRect::_VkClearRect() {
  instance = (VkClearRect*) malloc(sizeof(VkClearRect));
}

_VkClearRect::~_VkClearRect() { }

void _VkClearRect::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // Constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkClearRect::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkClearRect").ToLocalChecked());

  // Prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();
  SetPrototypeAccessor(proto, Nan::New("rect").ToLocalChecked(), Getrect, Setrect, ctor);
  SetPrototypeAccessor(proto, Nan::New("baseArrayLayer").ToLocalChecked(), GetbaseArrayLayer, SetbaseArrayLayer, ctor);
  SetPrototypeAccessor(proto, Nan::New("layerCount").ToLocalChecked(), GetlayerCount, SetlayerCount, ctor);
  
  Nan::Set(target, Nan::New("VkClearRect").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(_VkClearRect::New) {
  _VkClearRect* self = new _VkClearRect();
  self->Wrap(info.Holder());
  info.GetReturnValue().Set(info.Holder());
};

// rect
NAN_GETTER(_VkClearRect::Getrect) {
  _VkClearRect *self = Nan::ObjectWrap::Unwrap<_VkClearRect>(info.This());
  VkClearRect *instance = self->instance;
  if (self->rect != nullptr) {
    info.GetReturnValue().Set(self->rect->handle());
  } else {
    info.GetReturnValue().SetNull();
  }
}
NAN_SETTER(_VkClearRect::Setrect) {
  _VkClearRect *self = Nan::ObjectWrap::Unwrap<_VkClearRect>(info.This());
  VkClearRect *instance = self->instance;
  _VkRect2D* obj = Nan::ObjectWrap::Unwrap<_VkRect2D>(value->ToObject());
  self->rect = obj;
  instance->rect = *obj->instance;
}// baseArrayLayer
NAN_GETTER(_VkClearRect::GetbaseArrayLayer) {
  _VkClearRect *self = Nan::ObjectWrap::Unwrap<_VkClearRect>(info.This());
  VkClearRect *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->baseArrayLayer));
}
NAN_SETTER(_VkClearRect::SetbaseArrayLayer) {
  _VkClearRect *self = Nan::ObjectWrap::Unwrap<_VkClearRect>(info.This());
  VkClearRect *instance = self->instance;
  self->instance->baseArrayLayer = static_cast<uint32_t>(value->NumberValue());
}// layerCount
NAN_GETTER(_VkClearRect::GetlayerCount) {
  _VkClearRect *self = Nan::ObjectWrap::Unwrap<_VkClearRect>(info.This());
  VkClearRect *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->layerCount));
}
NAN_SETTER(_VkClearRect::SetlayerCount) {
  _VkClearRect *self = Nan::ObjectWrap::Unwrap<_VkClearRect>(info.This());
  VkClearRect *instance = self->instance;
  self->instance->layerCount = static_cast<uint32_t>(value->NumberValue());
}