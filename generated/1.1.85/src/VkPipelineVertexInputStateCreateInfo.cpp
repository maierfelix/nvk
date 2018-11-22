/*
 * MACHINE GENERATED, DO NOT EDIT
 * GENERATED BY node-vulkan v0.0.8
 */
#include "utils.h"
#include "index.h"
#include "VkPipelineVertexInputStateCreateInfo.h"

Nan::Persistent<v8::FunctionTemplate> _VkPipelineVertexInputStateCreateInfo::constructor;

_VkPipelineVertexInputStateCreateInfo::_VkPipelineVertexInputStateCreateInfo() {
  instance.sType = VK_STRUCTURE_TYPE_PIPELINE_VERTEX_INPUT_STATE_CREATE_INFO;
  vpVertexBindingDescriptions = new std::vector<VkVertexInputBindingDescription>;
  vpVertexAttributeDescriptions = new std::vector<VkVertexInputAttributeDescription>;
  
}

_VkPipelineVertexInputStateCreateInfo::~_VkPipelineVertexInputStateCreateInfo() {
  //printf("VkPipelineVertexInputStateCreateInfo deconstructed!!\n");
  
  
  pNext.Reset();
  
  
  
  vpVertexBindingDescriptions->clear();
  delete vpVertexBindingDescriptions;
  
  pVertexBindingDescriptions.Reset();
  
  
  vpVertexAttributeDescriptions->clear();
  delete vpVertexAttributeDescriptions;
  
  pVertexAttributeDescriptions.Reset();
  
}

void _VkPipelineVertexInputStateCreateInfo::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkPipelineVertexInputStateCreateInfo::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkPipelineVertexInputStateCreateInfo").ToLocalChecked());

  // prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();
  
  SetPrototypeAccessor(proto, Nan::New("sType").ToLocalChecked(), GetsType, SetsType, ctor);
  SetPrototypeAccessor(proto, Nan::New("pNext").ToLocalChecked(), GetpNext, SetpNext, ctor);
  SetPrototypeAccessor(proto, Nan::New("flags").ToLocalChecked(), Getflags, Setflags, ctor);
  SetPrototypeAccessor(proto, Nan::New("vertexBindingDescriptionCount").ToLocalChecked(), GetvertexBindingDescriptionCount, SetvertexBindingDescriptionCount, ctor);
  SetPrototypeAccessor(proto, Nan::New("pVertexBindingDescriptions").ToLocalChecked(), GetpVertexBindingDescriptions, SetpVertexBindingDescriptions, ctor);
  SetPrototypeAccessor(proto, Nan::New("vertexAttributeDescriptionCount").ToLocalChecked(), GetvertexAttributeDescriptionCount, SetvertexAttributeDescriptionCount, ctor);
  SetPrototypeAccessor(proto, Nan::New("pVertexAttributeDescriptions").ToLocalChecked(), GetpVertexAttributeDescriptions, SetpVertexAttributeDescriptions, ctor);
  Nan::Set(target, Nan::New("VkPipelineVertexInputStateCreateInfo").ToLocalChecked(), ctor->GetFunction());
}

bool _VkPipelineVertexInputStateCreateInfo::flush() {
  _VkPipelineVertexInputStateCreateInfo *self = this;
  if (!(self->pVertexBindingDescriptions.IsEmpty())) {
    v8::Local<v8::Value> value = Nan::New(self->pVertexBindingDescriptions);
    
    v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(value);
    // validate length
    if (array->Length() != self->instance.vertexBindingDescriptionCount) {
      Nan::ThrowRangeError("Invalid array length, expected array length of 'vertexBindingDescriptionCount' for 'VkPipelineVertexInputStateCreateInfo.pVertexBindingDescriptions'");
      return false;
    }
    std::vector<VkVertexInputBindingDescription>* data = self->vpVertexBindingDescriptions;
    data->clear();
    for (unsigned int ii = 0; ii < array->Length(); ++ii) {
      v8::Local<v8::Object> obj = Nan::To<v8::Object>(Nan::Get(array, ii).ToLocalChecked()).ToLocalChecked();
      if (!(Nan::New(_VkVertexInputBindingDescription::constructor)->HasInstance(obj))) {
        
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected '[object VkVertexInputBindingDescription]' for 'VkPipelineVertexInputStateCreateInfo.pVertexBindingDescriptions' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
        return false;
      }
      _VkVertexInputBindingDescription* result = Nan::ObjectWrap::Unwrap<_VkVertexInputBindingDescription>(obj);
      if (!result->flush()) return false;
      data->push_back(result->instance);
    };
    self->instance.pVertexBindingDescriptions = data->data();
  }if (!(self->pVertexAttributeDescriptions.IsEmpty())) {
    v8::Local<v8::Value> value = Nan::New(self->pVertexAttributeDescriptions);
    
    v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(value);
    // validate length
    if (array->Length() != self->instance.vertexAttributeDescriptionCount) {
      Nan::ThrowRangeError("Invalid array length, expected array length of 'vertexAttributeDescriptionCount' for 'VkPipelineVertexInputStateCreateInfo.pVertexAttributeDescriptions'");
      return false;
    }
    std::vector<VkVertexInputAttributeDescription>* data = self->vpVertexAttributeDescriptions;
    data->clear();
    for (unsigned int ii = 0; ii < array->Length(); ++ii) {
      v8::Local<v8::Object> obj = Nan::To<v8::Object>(Nan::Get(array, ii).ToLocalChecked()).ToLocalChecked();
      if (!(Nan::New(_VkVertexInputAttributeDescription::constructor)->HasInstance(obj))) {
        
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected '[object VkVertexInputAttributeDescription]' for 'VkPipelineVertexInputStateCreateInfo.pVertexAttributeDescriptions' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
        return false;
      }
      _VkVertexInputAttributeDescription* result = Nan::ObjectWrap::Unwrap<_VkVertexInputAttributeDescription>(obj);
      if (!result->flush()) return false;
      data->push_back(result->instance);
    };
    self->instance.pVertexAttributeDescriptions = data->data();
  }
  return true;
}

NAN_METHOD(_VkPipelineVertexInputStateCreateInfo::New) {
  if (info.IsConstructCall()) {
    _VkPipelineVertexInputStateCreateInfo* self = new _VkPipelineVertexInputStateCreateInfo();
    self->Wrap(info.Holder());
    
    if (info[0]->IsObject()) {
      v8::Local<v8::Object> obj = Nan::To<v8::Object>(info[0]).ToLocalChecked();
      v8::Local<v8::String> sAccess0 = Nan::New("sType").ToLocalChecked();
      v8::Local<v8::String> sAccess1 = Nan::New("pNext").ToLocalChecked();
      v8::Local<v8::String> sAccess2 = Nan::New("flags").ToLocalChecked();
      v8::Local<v8::String> sAccess3 = Nan::New("vertexBindingDescriptionCount").ToLocalChecked();
      v8::Local<v8::String> sAccess4 = Nan::New("pVertexBindingDescriptions").ToLocalChecked();
      v8::Local<v8::String> sAccess5 = Nan::New("vertexAttributeDescriptionCount").ToLocalChecked();
      v8::Local<v8::String> sAccess6 = Nan::New("pVertexAttributeDescriptions").ToLocalChecked();
      if (obj->Has(sAccess0)) info.This()->Set(sAccess0, obj->Get(sAccess0));
      if (obj->Has(sAccess1)) info.This()->Set(sAccess1, obj->Get(sAccess1));
      if (obj->Has(sAccess2)) info.This()->Set(sAccess2, obj->Get(sAccess2));
      if (obj->Has(sAccess3)) info.This()->Set(sAccess3, obj->Get(sAccess3));
      if (obj->Has(sAccess4)) info.This()->Set(sAccess4, obj->Get(sAccess4));
      if (obj->Has(sAccess5)) info.This()->Set(sAccess5, obj->Get(sAccess5));
      if (obj->Has(sAccess6)) info.This()->Set(sAccess6, obj->Get(sAccess6));
      
    }
    
    info.GetReturnValue().Set(info.Holder());
  } else {
    Nan::ThrowError("VkPipelineVertexInputStateCreateInfo constructor cannot be invoked without 'new'");
  }
};

// sType
NAN_GETTER(_VkPipelineVertexInputStateCreateInfo::GetsType) {
  _VkPipelineVertexInputStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineVertexInputStateCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.sType));
}NAN_SETTER(_VkPipelineVertexInputStateCreateInfo::SetsType) {
  _VkPipelineVertexInputStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineVertexInputStateCreateInfo>(info.This());
  if (value->IsNumber()) {
    self->instance.sType = static_cast<VkStructureType>(Nan::To<int32_t>(value).FromMaybe(0));
  } else {
    
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected 'Number' for 'VkPipelineVertexInputStateCreateInfo.sType' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
    return;
  }
}// pNext
NAN_GETTER(_VkPipelineVertexInputStateCreateInfo::GetpNext) {
  _VkPipelineVertexInputStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineVertexInputStateCreateInfo>(info.This());
}NAN_SETTER(_VkPipelineVertexInputStateCreateInfo::SetpNext) {
  _VkPipelineVertexInputStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineVertexInputStateCreateInfo>(info.This());
}// flags
NAN_GETTER(_VkPipelineVertexInputStateCreateInfo::Getflags) {
  _VkPipelineVertexInputStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineVertexInputStateCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.flags));
}NAN_SETTER(_VkPipelineVertexInputStateCreateInfo::Setflags) {
  _VkPipelineVertexInputStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineVertexInputStateCreateInfo>(info.This());
  if (value->IsNumber()) {
    self->instance.flags = static_cast<VkPipelineVertexInputStateCreateFlags>(Nan::To<int32_t>(value).FromMaybe(0));
  } else {
    
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected 'Number' for 'VkPipelineVertexInputStateCreateInfo.flags' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
    return;
  }
}// vertexBindingDescriptionCount
NAN_GETTER(_VkPipelineVertexInputStateCreateInfo::GetvertexBindingDescriptionCount) {
  _VkPipelineVertexInputStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineVertexInputStateCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.vertexBindingDescriptionCount));
}NAN_SETTER(_VkPipelineVertexInputStateCreateInfo::SetvertexBindingDescriptionCount) {
  _VkPipelineVertexInputStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineVertexInputStateCreateInfo>(info.This());
  if (value->IsNumber()) {
    self->instance.vertexBindingDescriptionCount = static_cast<uint32_t>(Nan::To<int64_t>(value).FromMaybe(0));
  } else {
    
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected 'Number' for 'VkPipelineVertexInputStateCreateInfo.vertexBindingDescriptionCount' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
    return;
  }
}// pVertexBindingDescriptions
NAN_GETTER(_VkPipelineVertexInputStateCreateInfo::GetpVertexBindingDescriptions) {
  _VkPipelineVertexInputStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineVertexInputStateCreateInfo>(info.This());
  if (self->pVertexBindingDescriptions.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::Object> obj = Nan::New(self->pVertexBindingDescriptions);
    info.GetReturnValue().Set(obj);
  }
}NAN_SETTER(_VkPipelineVertexInputStateCreateInfo::SetpVertexBindingDescriptions) {
  _VkPipelineVertexInputStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineVertexInputStateCreateInfo>(info.This());
  
    // js
    if (value->IsArray()) {
      self->pVertexBindingDescriptions.Reset<v8::Array>(value.As<v8::Array>());
    } else if (value->IsNull()) {
      self->pVertexBindingDescriptions.Reset();
      self->instance.pVertexBindingDescriptions = nullptr;
    } else {
      
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected '[object VkVertexInputBindingDescription]' for 'VkPipelineVertexInputStateCreateInfo.pVertexBindingDescriptions' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
      return;
    }
  
  // vulkan
  if (value->IsArray()) {
    
  } else if (value->IsNull()) {
    self->instance.pVertexBindingDescriptions = nullptr;
  } else {
    
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected '[object VkVertexInputBindingDescription]' for 'VkPipelineVertexInputStateCreateInfo.pVertexBindingDescriptions' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
    return;
  }
}// vertexAttributeDescriptionCount
NAN_GETTER(_VkPipelineVertexInputStateCreateInfo::GetvertexAttributeDescriptionCount) {
  _VkPipelineVertexInputStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineVertexInputStateCreateInfo>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.vertexAttributeDescriptionCount));
}NAN_SETTER(_VkPipelineVertexInputStateCreateInfo::SetvertexAttributeDescriptionCount) {
  _VkPipelineVertexInputStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineVertexInputStateCreateInfo>(info.This());
  if (value->IsNumber()) {
    self->instance.vertexAttributeDescriptionCount = static_cast<uint32_t>(Nan::To<int64_t>(value).FromMaybe(0));
  } else {
    
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected 'Number' for 'VkPipelineVertexInputStateCreateInfo.vertexAttributeDescriptionCount' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
    return;
  }
}// pVertexAttributeDescriptions
NAN_GETTER(_VkPipelineVertexInputStateCreateInfo::GetpVertexAttributeDescriptions) {
  _VkPipelineVertexInputStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineVertexInputStateCreateInfo>(info.This());
  if (self->pVertexAttributeDescriptions.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::Object> obj = Nan::New(self->pVertexAttributeDescriptions);
    info.GetReturnValue().Set(obj);
  }
}NAN_SETTER(_VkPipelineVertexInputStateCreateInfo::SetpVertexAttributeDescriptions) {
  _VkPipelineVertexInputStateCreateInfo *self = Nan::ObjectWrap::Unwrap<_VkPipelineVertexInputStateCreateInfo>(info.This());
  
    // js
    if (value->IsArray()) {
      self->pVertexAttributeDescriptions.Reset<v8::Array>(value.As<v8::Array>());
    } else if (value->IsNull()) {
      self->pVertexAttributeDescriptions.Reset();
      self->instance.pVertexAttributeDescriptions = nullptr;
    } else {
      
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected '[object VkVertexInputAttributeDescription]' for 'VkPipelineVertexInputStateCreateInfo.pVertexAttributeDescriptions' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
      return;
    }
  
  // vulkan
  if (value->IsArray()) {
    
  } else if (value->IsNull()) {
    self->instance.pVertexAttributeDescriptions = nullptr;
  } else {
    
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected '[object VkVertexInputAttributeDescription]' for 'VkPipelineVertexInputStateCreateInfo.pVertexAttributeDescriptions' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
    return;
  }
}