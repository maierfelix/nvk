/*
 * MACHINE GENERATED, DO NOT EDIT
 * GENERATED BY node-vulkan v0.0.8
 */
#include "utils.h"
#include "index.h"
#include "VkCommandBufferAllocateInfo.h"

Nan::Persistent<v8::FunctionTemplate> _VkCommandBufferAllocateInfo::constructor;

_VkCommandBufferAllocateInfo::_VkCommandBufferAllocateInfo() {
  instance.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
  
}

_VkCommandBufferAllocateInfo::~_VkCommandBufferAllocateInfo() {
  //printf("VkCommandBufferAllocateInfo deconstructed!!\n");
  
  
  pNext.Reset();
  
  
  
  
}

void _VkCommandBufferAllocateInfo::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkCommandBufferAllocateInfo::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkCommandBufferAllocateInfo").ToLocalChecked());

  // prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();
  
  SetPrototypeAccessor(proto, Nan::New("sType").ToLocalChecked(), GetsType, SetsType, ctor);
  SetPrototypeAccessor(proto, Nan::New("pNext").ToLocalChecked(), GetpNext, SetpNext, ctor);
  SetPrototypeAccessor(proto, Nan::New("commandPool").ToLocalChecked(), GetcommandPool, SetcommandPool, ctor);
  SetPrototypeAccessor(proto, Nan::New("level").ToLocalChecked(), Getlevel, Setlevel, ctor);
  SetPrototypeAccessor(proto, Nan::New("commandBufferCount").ToLocalChecked(), GetcommandBufferCount, SetcommandBufferCount, ctor);
  Nan::Set(target, Nan::New("VkCommandBufferAllocateInfo").ToLocalChecked(), ctor->GetFunction());
}

bool _VkCommandBufferAllocateInfo::flush() {
  _VkCommandBufferAllocateInfo *self = this;
  
  return true;
}

NAN_METHOD(_VkCommandBufferAllocateInfo::New) {
  if (info.IsConstructCall()) {
    _VkCommandBufferAllocateInfo* self = new _VkCommandBufferAllocateInfo();
    self->Wrap(info.Holder());
    
    if (info[0]->IsObject()) {
      v8::Local<v8::Object> obj = Nan::To<v8::Object>(info[0]).ToLocalChecked();
      v8::Local<v8::String> sAccess0 = Nan::New("sType").ToLocalChecked();
      v8::Local<v8::String> sAccess1 = Nan::New("pNext").ToLocalChecked();
      v8::Local<v8::String> sAccess2 = Nan::New("commandPool").ToLocalChecked();
      v8::Local<v8::String> sAccess3 = Nan::New("level").ToLocalChecked();
      v8::Local<v8::String> sAccess4 = Nan::New("commandBufferCount").ToLocalChecked();
      if (obj->Has(sAccess0)) info.This()->Set(sAccess0, obj->Get(sAccess0));
      if (obj->Has(sAccess1)) info.This()->Set(sAccess1, obj->Get(sAccess1));
      if (obj->Has(sAccess2)) info.This()->Set(sAccess2, obj->Get(sAccess2));
      if (obj->Has(sAccess3)) info.This()->Set(sAccess3, obj->Get(sAccess3));
      if (obj->Has(sAccess4)) info.This()->Set(sAccess4, obj->Get(sAccess4));
      
    }
    
    info.GetReturnValue().Set(info.Holder());
  } else {
    Nan::ThrowError("VkCommandBufferAllocateInfo constructor cannot be invoked without 'new'");
  }
};

// sType
NAN_GETTER(_VkCommandBufferAllocateInfo::GetsType) {
  _VkCommandBufferAllocateInfo *self = Nan::ObjectWrap::Unwrap<_VkCommandBufferAllocateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.sType));
}NAN_SETTER(_VkCommandBufferAllocateInfo::SetsType) {
  _VkCommandBufferAllocateInfo *self = Nan::ObjectWrap::Unwrap<_VkCommandBufferAllocateInfo>(info.This());
  if (value->IsNumber()) {
    self->instance.sType = static_cast<VkStructureType>(Nan::To<int32_t>(value).FromMaybe(0));
  } else {
    
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected 'Number' for 'VkCommandBufferAllocateInfo.sType' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
    return;
  }
}// pNext
NAN_GETTER(_VkCommandBufferAllocateInfo::GetpNext) {
  _VkCommandBufferAllocateInfo *self = Nan::ObjectWrap::Unwrap<_VkCommandBufferAllocateInfo>(info.This());
}NAN_SETTER(_VkCommandBufferAllocateInfo::SetpNext) {
  _VkCommandBufferAllocateInfo *self = Nan::ObjectWrap::Unwrap<_VkCommandBufferAllocateInfo>(info.This());
}// commandPool
NAN_GETTER(_VkCommandBufferAllocateInfo::GetcommandPool) {
  _VkCommandBufferAllocateInfo *self = Nan::ObjectWrap::Unwrap<_VkCommandBufferAllocateInfo>(info.This());
  if (self->commandPool.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::Object> obj = Nan::New(self->commandPool);
    info.GetReturnValue().Set(obj);
  }
}NAN_SETTER(_VkCommandBufferAllocateInfo::SetcommandPool) {
  _VkCommandBufferAllocateInfo *self = Nan::ObjectWrap::Unwrap<_VkCommandBufferAllocateInfo>(info.This());
  // js
  if (!value->IsNull()) {
    v8::Local<v8::Object> obj = Nan::To<v8::Object>(value).ToLocalChecked();
    if (Nan::New(_VkCommandPool::constructor)->HasInstance(obj)) {
      self->commandPool.Reset<v8::Object>(value.As<v8::Object>());
      _VkCommandPool* inst = Nan::ObjectWrap::Unwrap<_VkCommandPool>(obj);
      ;
      self->instance.commandPool = inst->instance;
    } else {
      
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected '[object VkCommandPool]' for 'VkCommandBufferAllocateInfo.commandPool' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
      return;
    }
  } else if (value->IsNull()) {
    self->commandPool.Reset();
    self->instance.commandPool = VK_NULL_HANDLE;
  } else {
    
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected '[object VkCommandPool]' for 'VkCommandBufferAllocateInfo.commandPool' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
    return;
  }
}// level
NAN_GETTER(_VkCommandBufferAllocateInfo::Getlevel) {
  _VkCommandBufferAllocateInfo *self = Nan::ObjectWrap::Unwrap<_VkCommandBufferAllocateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.level));
}NAN_SETTER(_VkCommandBufferAllocateInfo::Setlevel) {
  _VkCommandBufferAllocateInfo *self = Nan::ObjectWrap::Unwrap<_VkCommandBufferAllocateInfo>(info.This());
  if (value->IsNumber()) {
    self->instance.level = static_cast<VkCommandBufferLevel>(Nan::To<int32_t>(value).FromMaybe(0));
  } else {
    
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected 'Number' for 'VkCommandBufferAllocateInfo.level' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
    return;
  }
}// commandBufferCount
NAN_GETTER(_VkCommandBufferAllocateInfo::GetcommandBufferCount) {
  _VkCommandBufferAllocateInfo *self = Nan::ObjectWrap::Unwrap<_VkCommandBufferAllocateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.commandBufferCount));
}NAN_SETTER(_VkCommandBufferAllocateInfo::SetcommandBufferCount) {
  _VkCommandBufferAllocateInfo *self = Nan::ObjectWrap::Unwrap<_VkCommandBufferAllocateInfo>(info.This());
  if (value->IsNumber()) {
    self->instance.commandBufferCount = static_cast<uint32_t>(Nan::To<int64_t>(value).FromMaybe(0));
  } else {
    
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected 'Number' for 'VkCommandBufferAllocateInfo.commandBufferCount' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
    return;
  }
}