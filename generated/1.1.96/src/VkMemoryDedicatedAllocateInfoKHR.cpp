/*
 * MACHINE GENERATED, DO NOT EDIT
 * GENERATED BY node-vulkan v0.1.0
 */
#include "utils.h"
#include "index.h"
#include "VkMemoryDedicatedAllocateInfoKHR.h"

Nan::Persistent<v8::FunctionTemplate> _VkMemoryDedicatedAllocateInfoKHR::constructor;

_VkMemoryDedicatedAllocateInfoKHR::_VkMemoryDedicatedAllocateInfoKHR() {
  
  
}

_VkMemoryDedicatedAllocateInfoKHR::~_VkMemoryDedicatedAllocateInfoKHR() {
  //printf("VkMemoryDedicatedAllocateInfoKHR deconstructed!!\n");
  
}

void _VkMemoryDedicatedAllocateInfoKHR::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkMemoryDedicatedAllocateInfoKHR::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkMemoryDedicatedAllocateInfoKHR").ToLocalChecked());

  // prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();
  
  Nan::Set(target, Nan::New("VkMemoryDedicatedAllocateInfoKHR").ToLocalChecked(), ctor->GetFunction());
}

bool _VkMemoryDedicatedAllocateInfoKHR::flush() {
  _VkMemoryDedicatedAllocateInfoKHR *self = this;
  
  return true;
}

NAN_METHOD(_VkMemoryDedicatedAllocateInfoKHR::New) {
  if (info.IsConstructCall()) {
    _VkMemoryDedicatedAllocateInfoKHR* self = new _VkMemoryDedicatedAllocateInfoKHR();
    self->Wrap(info.Holder());
    
    if (info[0]->IsObject()) {
      v8::Local<v8::Object> obj = Nan::To<v8::Object>(info[0]).ToLocalChecked();
      
    }
    
    info.GetReturnValue().Set(info.Holder());
  } else {
    Nan::ThrowError("VkMemoryDedicatedAllocateInfoKHR constructor cannot be invoked without 'new'");
  }
};
