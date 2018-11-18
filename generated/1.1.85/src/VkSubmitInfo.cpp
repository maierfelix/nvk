/*
 * MACHINE GENERATED, DO NOT EDIT
 * GENERATED BY node-vulkan v0.0.1
 */
#include "utils.h"
#include "index.h"
#include "VkSubmitInfo.h"

Nan::Persistent<v8::FunctionTemplate> _VkSubmitInfo::constructor;

_VkSubmitInfo::_VkSubmitInfo() {
  instance.sType = VK_STRUCTURE_TYPE_SUBMIT_INFO;
}

_VkSubmitInfo::~_VkSubmitInfo() {
  //printf("VkSubmitInfo deconstructed!!\n");
}

void _VkSubmitInfo::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkSubmitInfo::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkSubmitInfo").ToLocalChecked());

  // prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();
  
  SetPrototypeAccessor(proto, Nan::New("sType").ToLocalChecked(), GetsType, SetsType, ctor);
  SetPrototypeAccessor(proto, Nan::New("pNext").ToLocalChecked(), GetpNext, SetpNext, ctor);
  SetPrototypeAccessor(proto, Nan::New("waitSemaphoreCount").ToLocalChecked(), GetwaitSemaphoreCount, SetwaitSemaphoreCount, ctor);
  SetPrototypeAccessor(proto, Nan::New("pWaitSemaphores").ToLocalChecked(), GetpWaitSemaphores, SetpWaitSemaphores, ctor);
  SetPrototypeAccessor(proto, Nan::New("pWaitDstStageMask").ToLocalChecked(), GetpWaitDstStageMask, SetpWaitDstStageMask, ctor);
  SetPrototypeAccessor(proto, Nan::New("commandBufferCount").ToLocalChecked(), GetcommandBufferCount, SetcommandBufferCount, ctor);
  SetPrototypeAccessor(proto, Nan::New("pCommandBuffers").ToLocalChecked(), GetpCommandBuffers, SetpCommandBuffers, ctor);
  SetPrototypeAccessor(proto, Nan::New("signalSemaphoreCount").ToLocalChecked(), GetsignalSemaphoreCount, SetsignalSemaphoreCount, ctor);
  SetPrototypeAccessor(proto, Nan::New("pSignalSemaphores").ToLocalChecked(), GetpSignalSemaphores, SetpSignalSemaphores, ctor);
  Nan::Set(target, Nan::New("VkSubmitInfo").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(_VkSubmitInfo::New) {
  if (info.IsConstructCall()) {
    _VkSubmitInfo* self = new _VkSubmitInfo();
    self->Wrap(info.Holder());
    
    if (info[0]->IsObject()) {
      v8::Local<v8::Object> obj = info[0]->ToObject();
      v8::Local<v8::String> sAccess0 = Nan::New("sType").ToLocalChecked();
      v8::Local<v8::String> sAccess1 = Nan::New("pNext").ToLocalChecked();
      v8::Local<v8::String> sAccess2 = Nan::New("waitSemaphoreCount").ToLocalChecked();
      v8::Local<v8::String> sAccess3 = Nan::New("pWaitSemaphores").ToLocalChecked();
      v8::Local<v8::String> sAccess4 = Nan::New("pWaitDstStageMask").ToLocalChecked();
      v8::Local<v8::String> sAccess5 = Nan::New("commandBufferCount").ToLocalChecked();
      v8::Local<v8::String> sAccess6 = Nan::New("pCommandBuffers").ToLocalChecked();
      v8::Local<v8::String> sAccess7 = Nan::New("signalSemaphoreCount").ToLocalChecked();
      v8::Local<v8::String> sAccess8 = Nan::New("pSignalSemaphores").ToLocalChecked();
      if (obj->Has(sAccess0)) info.This()->Set(sAccess0, obj->Get(sAccess0));
      if (obj->Has(sAccess1)) info.This()->Set(sAccess1, obj->Get(sAccess1));
      if (obj->Has(sAccess2)) info.This()->Set(sAccess2, obj->Get(sAccess2));
      if (obj->Has(sAccess3)) info.This()->Set(sAccess3, obj->Get(sAccess3));
      if (obj->Has(sAccess4)) info.This()->Set(sAccess4, obj->Get(sAccess4));
      if (obj->Has(sAccess5)) info.This()->Set(sAccess5, obj->Get(sAccess5));
      if (obj->Has(sAccess6)) info.This()->Set(sAccess6, obj->Get(sAccess6));
      if (obj->Has(sAccess7)) info.This()->Set(sAccess7, obj->Get(sAccess7));
      if (obj->Has(sAccess8)) info.This()->Set(sAccess8, obj->Get(sAccess8));
      
    }
    
    info.GetReturnValue().Set(info.Holder());
  } else {
    Nan::ThrowError("VkSubmitInfo constructor cannot be invoked without 'new'");
  }
};

// sType
NAN_GETTER(_VkSubmitInfo::GetsType) {
  _VkSubmitInfo *self = Nan::ObjectWrap::Unwrap<_VkSubmitInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.sType));
}NAN_SETTER(_VkSubmitInfo::SetsType) {
  _VkSubmitInfo *self = Nan::ObjectWrap::Unwrap<_VkSubmitInfo>(info.This());
  self->instance.sType = static_cast<VkStructureType>((int32_t)value->NumberValue());
}// pNext
NAN_GETTER(_VkSubmitInfo::GetpNext) {
  _VkSubmitInfo *self = Nan::ObjectWrap::Unwrap<_VkSubmitInfo>(info.This());
}NAN_SETTER(_VkSubmitInfo::SetpNext) {
  _VkSubmitInfo *self = Nan::ObjectWrap::Unwrap<_VkSubmitInfo>(info.This());
}// waitSemaphoreCount
NAN_GETTER(_VkSubmitInfo::GetwaitSemaphoreCount) {
  _VkSubmitInfo *self = Nan::ObjectWrap::Unwrap<_VkSubmitInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.waitSemaphoreCount));
}NAN_SETTER(_VkSubmitInfo::SetwaitSemaphoreCount) {
  _VkSubmitInfo *self = Nan::ObjectWrap::Unwrap<_VkSubmitInfo>(info.This());
  self->instance.waitSemaphoreCount = static_cast<uint32_t>(value->NumberValue());
}// pWaitSemaphores
NAN_GETTER(_VkSubmitInfo::GetpWaitSemaphores) {
  _VkSubmitInfo *self = Nan::ObjectWrap::Unwrap<_VkSubmitInfo>(info.This());
  if (self->pWaitSemaphores.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::Object> obj = Nan::New(self->pWaitSemaphores);
    info.GetReturnValue().Set(obj);
  }
}NAN_SETTER(_VkSubmitInfo::SetpWaitSemaphores) {
  _VkSubmitInfo *self = Nan::ObjectWrap::Unwrap<_VkSubmitInfo>(info.This());
  
    // js
    if (value->IsArray() || value->IsArrayBufferView()) {
      v8::Handle<v8::Array> arr = v8::Handle<v8::Array>::Cast(value);
      Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> obj(arr);
      self->pWaitSemaphores = obj;
    } else {
      if (!self->pWaitSemaphores.IsEmpty()) self->pWaitSemaphores.Empty();
    }
  
  // vulkan
  if (!(value->IsNull())) {
    self->instance.pWaitSemaphores = copyArrayOfV8Objects<VkSemaphore, _VkSemaphore>(value);
  } else {
    self->instance.pWaitSemaphores = VK_NULL_HANDLE;
  }
}// pWaitDstStageMask
NAN_GETTER(_VkSubmitInfo::GetpWaitDstStageMask) {
  _VkSubmitInfo *self = Nan::ObjectWrap::Unwrap<_VkSubmitInfo>(info.This());
  if (self->pWaitDstStageMask.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::Object> obj = Nan::New(self->pWaitDstStageMask);
    info.GetReturnValue().Set(obj);
  }
}NAN_SETTER(_VkSubmitInfo::SetpWaitDstStageMask) {
  _VkSubmitInfo *self = Nan::ObjectWrap::Unwrap<_VkSubmitInfo>(info.This());
  
    // js
    if (value->IsArray() || value->IsArrayBufferView()) {
      v8::Handle<v8::Array> arr = v8::Handle<v8::Array>::Cast(value);
      Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> obj(arr);
      self->pWaitDstStageMask = obj;
    } else {
      if (!self->pWaitDstStageMask.IsEmpty()) self->pWaitDstStageMask.Empty();
    }
  
  
  // vulkan
  if (value->IsArrayBufferView()) {
    self->instance.pWaitDstStageMask = reinterpret_cast<const VkPipelineStageFlags *>(getTypedArrayData<int32_t>(value->ToObject(), nullptr));
  } else {
    self->instance.pWaitDstStageMask = nullptr;
  }
}// commandBufferCount
NAN_GETTER(_VkSubmitInfo::GetcommandBufferCount) {
  _VkSubmitInfo *self = Nan::ObjectWrap::Unwrap<_VkSubmitInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.commandBufferCount));
}NAN_SETTER(_VkSubmitInfo::SetcommandBufferCount) {
  _VkSubmitInfo *self = Nan::ObjectWrap::Unwrap<_VkSubmitInfo>(info.This());
  self->instance.commandBufferCount = static_cast<uint32_t>(value->NumberValue());
}// pCommandBuffers
NAN_GETTER(_VkSubmitInfo::GetpCommandBuffers) {
  _VkSubmitInfo *self = Nan::ObjectWrap::Unwrap<_VkSubmitInfo>(info.This());
  if (self->pCommandBuffers.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::Object> obj = Nan::New(self->pCommandBuffers);
    info.GetReturnValue().Set(obj);
  }
}NAN_SETTER(_VkSubmitInfo::SetpCommandBuffers) {
  _VkSubmitInfo *self = Nan::ObjectWrap::Unwrap<_VkSubmitInfo>(info.This());
  
    // js
    if (value->IsArray() || value->IsArrayBufferView()) {
      v8::Handle<v8::Array> arr = v8::Handle<v8::Array>::Cast(value);
      Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> obj(arr);
      self->pCommandBuffers = obj;
    } else {
      if (!self->pCommandBuffers.IsEmpty()) self->pCommandBuffers.Empty();
    }
  
  // vulkan
  if (!(value->IsNull())) {
    self->instance.pCommandBuffers = copyArrayOfV8Objects<VkCommandBuffer, _VkCommandBuffer>(value);
  } else {
    self->instance.pCommandBuffers = VK_NULL_HANDLE;
  }
}// signalSemaphoreCount
NAN_GETTER(_VkSubmitInfo::GetsignalSemaphoreCount) {
  _VkSubmitInfo *self = Nan::ObjectWrap::Unwrap<_VkSubmitInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.signalSemaphoreCount));
}NAN_SETTER(_VkSubmitInfo::SetsignalSemaphoreCount) {
  _VkSubmitInfo *self = Nan::ObjectWrap::Unwrap<_VkSubmitInfo>(info.This());
  self->instance.signalSemaphoreCount = static_cast<uint32_t>(value->NumberValue());
}// pSignalSemaphores
NAN_GETTER(_VkSubmitInfo::GetpSignalSemaphores) {
  _VkSubmitInfo *self = Nan::ObjectWrap::Unwrap<_VkSubmitInfo>(info.This());
  if (self->pSignalSemaphores.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::Object> obj = Nan::New(self->pSignalSemaphores);
    info.GetReturnValue().Set(obj);
  }
}NAN_SETTER(_VkSubmitInfo::SetpSignalSemaphores) {
  _VkSubmitInfo *self = Nan::ObjectWrap::Unwrap<_VkSubmitInfo>(info.This());
  
    // js
    if (value->IsArray() || value->IsArrayBufferView()) {
      v8::Handle<v8::Array> arr = v8::Handle<v8::Array>::Cast(value);
      Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> obj(arr);
      self->pSignalSemaphores = obj;
    } else {
      if (!self->pSignalSemaphores.IsEmpty()) self->pSignalSemaphores.Empty();
    }
  
  // vulkan
  if (!(value->IsNull())) {
    self->instance.pSignalSemaphores = copyArrayOfV8Objects<VkSemaphore, _VkSemaphore>(value);
  } else {
    self->instance.pSignalSemaphores = VK_NULL_HANDLE;
  }
}