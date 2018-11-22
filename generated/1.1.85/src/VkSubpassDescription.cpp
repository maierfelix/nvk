/*
 * MACHINE GENERATED, DO NOT EDIT
 * GENERATED BY node-vulkan v0.0.8
 */
#include "utils.h"
#include "index.h"
#include "VkSubpassDescription.h"

Nan::Persistent<v8::FunctionTemplate> _VkSubpassDescription::constructor;

_VkSubpassDescription::_VkSubpassDescription() {
  
  vpInputAttachments = new std::vector<VkAttachmentReference>;
  vpColorAttachments = new std::vector<VkAttachmentReference>;
  vpResolveAttachments = new std::vector<VkAttachmentReference>;
  
}

_VkSubpassDescription::~_VkSubpassDescription() {
  //printf("VkSubpassDescription deconstructed!!\n");
  
  
  
  
  vpInputAttachments->clear();
  delete vpInputAttachments;
  
  pInputAttachments.Reset();
  
  
  vpColorAttachments->clear();
  delete vpColorAttachments;
  
  pColorAttachments.Reset();
  
  vpResolveAttachments->clear();
  delete vpResolveAttachments;
  
  pResolveAttachments.Reset();
  
  pDepthStencilAttachment.Reset();
  
  
  pPreserveAttachments.Reset();
  
}

void _VkSubpassDescription::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkSubpassDescription::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkSubpassDescription").ToLocalChecked());

  // prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();
  
  SetPrototypeAccessor(proto, Nan::New("flags").ToLocalChecked(), Getflags, Setflags, ctor);
  SetPrototypeAccessor(proto, Nan::New("pipelineBindPoint").ToLocalChecked(), GetpipelineBindPoint, SetpipelineBindPoint, ctor);
  SetPrototypeAccessor(proto, Nan::New("inputAttachmentCount").ToLocalChecked(), GetinputAttachmentCount, SetinputAttachmentCount, ctor);
  SetPrototypeAccessor(proto, Nan::New("pInputAttachments").ToLocalChecked(), GetpInputAttachments, SetpInputAttachments, ctor);
  SetPrototypeAccessor(proto, Nan::New("colorAttachmentCount").ToLocalChecked(), GetcolorAttachmentCount, SetcolorAttachmentCount, ctor);
  SetPrototypeAccessor(proto, Nan::New("pColorAttachments").ToLocalChecked(), GetpColorAttachments, SetpColorAttachments, ctor);
  SetPrototypeAccessor(proto, Nan::New("pResolveAttachments").ToLocalChecked(), GetpResolveAttachments, SetpResolveAttachments, ctor);
  SetPrototypeAccessor(proto, Nan::New("pDepthStencilAttachment").ToLocalChecked(), GetpDepthStencilAttachment, SetpDepthStencilAttachment, ctor);
  SetPrototypeAccessor(proto, Nan::New("preserveAttachmentCount").ToLocalChecked(), GetpreserveAttachmentCount, SetpreserveAttachmentCount, ctor);
  SetPrototypeAccessor(proto, Nan::New("pPreserveAttachments").ToLocalChecked(), GetpPreserveAttachments, SetpPreserveAttachments, ctor);
  Nan::Set(target, Nan::New("VkSubpassDescription").ToLocalChecked(), ctor->GetFunction());
}

bool _VkSubpassDescription::flush() {
  _VkSubpassDescription *self = this;
  if (!(self->pInputAttachments.IsEmpty())) {
    v8::Local<v8::Value> value = Nan::New(self->pInputAttachments);
    
    v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(value);
    // validate length
    if (array->Length() != self->instance.inputAttachmentCount) {
      Nan::ThrowRangeError("Invalid array length, expected array length of 'inputAttachmentCount' for 'VkSubpassDescription.pInputAttachments'");
      return false;
    }
    std::vector<VkAttachmentReference>* data = self->vpInputAttachments;
    data->clear();
    for (unsigned int ii = 0; ii < array->Length(); ++ii) {
      v8::Local<v8::Object> obj = Nan::To<v8::Object>(Nan::Get(array, ii).ToLocalChecked()).ToLocalChecked();
      if (!(Nan::New(_VkAttachmentReference::constructor)->HasInstance(obj))) {
        
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected '[object VkAttachmentReference]' for 'VkSubpassDescription.pInputAttachments' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
        return false;
      }
      _VkAttachmentReference* result = Nan::ObjectWrap::Unwrap<_VkAttachmentReference>(obj);
      if (!result->flush()) return false;
      data->push_back(result->instance);
    };
    self->instance.pInputAttachments = data->data();
  }if (!(self->pColorAttachments.IsEmpty())) {
    v8::Local<v8::Value> value = Nan::New(self->pColorAttachments);
    
    v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(value);
    // validate length
    if (array->Length() != self->instance.colorAttachmentCount) {
      Nan::ThrowRangeError("Invalid array length, expected array length of 'colorAttachmentCount' for 'VkSubpassDescription.pColorAttachments'");
      return false;
    }
    std::vector<VkAttachmentReference>* data = self->vpColorAttachments;
    data->clear();
    for (unsigned int ii = 0; ii < array->Length(); ++ii) {
      v8::Local<v8::Object> obj = Nan::To<v8::Object>(Nan::Get(array, ii).ToLocalChecked()).ToLocalChecked();
      if (!(Nan::New(_VkAttachmentReference::constructor)->HasInstance(obj))) {
        
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected '[object VkAttachmentReference]' for 'VkSubpassDescription.pColorAttachments' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
        return false;
      }
      _VkAttachmentReference* result = Nan::ObjectWrap::Unwrap<_VkAttachmentReference>(obj);
      if (!result->flush()) return false;
      data->push_back(result->instance);
    };
    self->instance.pColorAttachments = data->data();
  }if (!(self->pResolveAttachments.IsEmpty())) {
    v8::Local<v8::Value> value = Nan::New(self->pResolveAttachments);
    
    v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(value);
    // validate length
    if (array->Length() != self->instance.colorAttachmentCount) {
      Nan::ThrowRangeError("Invalid array length, expected array length of 'colorAttachmentCount' for 'VkSubpassDescription.pResolveAttachments'");
      return false;
    }
    std::vector<VkAttachmentReference>* data = self->vpResolveAttachments;
    data->clear();
    for (unsigned int ii = 0; ii < array->Length(); ++ii) {
      v8::Local<v8::Object> obj = Nan::To<v8::Object>(Nan::Get(array, ii).ToLocalChecked()).ToLocalChecked();
      if (!(Nan::New(_VkAttachmentReference::constructor)->HasInstance(obj))) {
        
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected '[object VkAttachmentReference]' for 'VkSubpassDescription.pResolveAttachments' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
        return false;
      }
      _VkAttachmentReference* result = Nan::ObjectWrap::Unwrap<_VkAttachmentReference>(obj);
      if (!result->flush()) return false;
      data->push_back(result->instance);
    };
    self->instance.pResolveAttachments = data->data();
  }
  return true;
}

NAN_METHOD(_VkSubpassDescription::New) {
  if (info.IsConstructCall()) {
    _VkSubpassDescription* self = new _VkSubpassDescription();
    self->Wrap(info.Holder());
    
    if (info[0]->IsObject()) {
      v8::Local<v8::Object> obj = Nan::To<v8::Object>(info[0]).ToLocalChecked();
      v8::Local<v8::String> sAccess0 = Nan::New("flags").ToLocalChecked();
      v8::Local<v8::String> sAccess1 = Nan::New("pipelineBindPoint").ToLocalChecked();
      v8::Local<v8::String> sAccess2 = Nan::New("inputAttachmentCount").ToLocalChecked();
      v8::Local<v8::String> sAccess3 = Nan::New("pInputAttachments").ToLocalChecked();
      v8::Local<v8::String> sAccess4 = Nan::New("colorAttachmentCount").ToLocalChecked();
      v8::Local<v8::String> sAccess5 = Nan::New("pColorAttachments").ToLocalChecked();
      v8::Local<v8::String> sAccess6 = Nan::New("pResolveAttachments").ToLocalChecked();
      v8::Local<v8::String> sAccess7 = Nan::New("pDepthStencilAttachment").ToLocalChecked();
      v8::Local<v8::String> sAccess8 = Nan::New("preserveAttachmentCount").ToLocalChecked();
      v8::Local<v8::String> sAccess9 = Nan::New("pPreserveAttachments").ToLocalChecked();
      if (obj->Has(sAccess0)) info.This()->Set(sAccess0, obj->Get(sAccess0));
      if (obj->Has(sAccess1)) info.This()->Set(sAccess1, obj->Get(sAccess1));
      if (obj->Has(sAccess2)) info.This()->Set(sAccess2, obj->Get(sAccess2));
      if (obj->Has(sAccess3)) info.This()->Set(sAccess3, obj->Get(sAccess3));
      if (obj->Has(sAccess4)) info.This()->Set(sAccess4, obj->Get(sAccess4));
      if (obj->Has(sAccess5)) info.This()->Set(sAccess5, obj->Get(sAccess5));
      if (obj->Has(sAccess6)) info.This()->Set(sAccess6, obj->Get(sAccess6));
      if (obj->Has(sAccess7)) info.This()->Set(sAccess7, obj->Get(sAccess7));
      if (obj->Has(sAccess8)) info.This()->Set(sAccess8, obj->Get(sAccess8));
      if (obj->Has(sAccess9)) info.This()->Set(sAccess9, obj->Get(sAccess9));
      
    }
    
    info.GetReturnValue().Set(info.Holder());
  } else {
    Nan::ThrowError("VkSubpassDescription constructor cannot be invoked without 'new'");
  }
};

// flags
NAN_GETTER(_VkSubpassDescription::Getflags) {
  _VkSubpassDescription *self = Nan::ObjectWrap::Unwrap<_VkSubpassDescription>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.flags));
}NAN_SETTER(_VkSubpassDescription::Setflags) {
  _VkSubpassDescription *self = Nan::ObjectWrap::Unwrap<_VkSubpassDescription>(info.This());
  if (value->IsNumber()) {
    self->instance.flags = static_cast<VkSubpassDescriptionFlags>(Nan::To<int32_t>(value).FromMaybe(0));
  } else {
    
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected 'Number' for 'VkSubpassDescription.flags' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
    return;
  }
}// pipelineBindPoint
NAN_GETTER(_VkSubpassDescription::GetpipelineBindPoint) {
  _VkSubpassDescription *self = Nan::ObjectWrap::Unwrap<_VkSubpassDescription>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.pipelineBindPoint));
}NAN_SETTER(_VkSubpassDescription::SetpipelineBindPoint) {
  _VkSubpassDescription *self = Nan::ObjectWrap::Unwrap<_VkSubpassDescription>(info.This());
  if (value->IsNumber()) {
    self->instance.pipelineBindPoint = static_cast<VkPipelineBindPoint>(Nan::To<int32_t>(value).FromMaybe(0));
  } else {
    
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected 'Number' for 'VkSubpassDescription.pipelineBindPoint' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
    return;
  }
}// inputAttachmentCount
NAN_GETTER(_VkSubpassDescription::GetinputAttachmentCount) {
  _VkSubpassDescription *self = Nan::ObjectWrap::Unwrap<_VkSubpassDescription>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.inputAttachmentCount));
}NAN_SETTER(_VkSubpassDescription::SetinputAttachmentCount) {
  _VkSubpassDescription *self = Nan::ObjectWrap::Unwrap<_VkSubpassDescription>(info.This());
  if (value->IsNumber()) {
    self->instance.inputAttachmentCount = static_cast<uint32_t>(Nan::To<int64_t>(value).FromMaybe(0));
  } else {
    
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected 'Number' for 'VkSubpassDescription.inputAttachmentCount' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
    return;
  }
}// pInputAttachments
NAN_GETTER(_VkSubpassDescription::GetpInputAttachments) {
  _VkSubpassDescription *self = Nan::ObjectWrap::Unwrap<_VkSubpassDescription>(info.This());
  if (self->pInputAttachments.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::Object> obj = Nan::New(self->pInputAttachments);
    info.GetReturnValue().Set(obj);
  }
}NAN_SETTER(_VkSubpassDescription::SetpInputAttachments) {
  _VkSubpassDescription *self = Nan::ObjectWrap::Unwrap<_VkSubpassDescription>(info.This());
  
    // js
    if (value->IsArray()) {
      self->pInputAttachments.Reset<v8::Array>(value.As<v8::Array>());
    } else if (value->IsNull()) {
      self->pInputAttachments.Reset();
      self->instance.pInputAttachments = nullptr;
    } else {
      
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected '[object VkAttachmentReference]' for 'VkSubpassDescription.pInputAttachments' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
      return;
    }
  
  // vulkan
  if (value->IsArray()) {
    
  } else if (value->IsNull()) {
    self->instance.pInputAttachments = nullptr;
  } else {
    
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected '[object VkAttachmentReference]' for 'VkSubpassDescription.pInputAttachments' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
    return;
  }
}// colorAttachmentCount
NAN_GETTER(_VkSubpassDescription::GetcolorAttachmentCount) {
  _VkSubpassDescription *self = Nan::ObjectWrap::Unwrap<_VkSubpassDescription>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.colorAttachmentCount));
}NAN_SETTER(_VkSubpassDescription::SetcolorAttachmentCount) {
  _VkSubpassDescription *self = Nan::ObjectWrap::Unwrap<_VkSubpassDescription>(info.This());
  if (value->IsNumber()) {
    self->instance.colorAttachmentCount = static_cast<uint32_t>(Nan::To<int64_t>(value).FromMaybe(0));
  } else {
    
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected 'Number' for 'VkSubpassDescription.colorAttachmentCount' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
    return;
  }
}// pColorAttachments
NAN_GETTER(_VkSubpassDescription::GetpColorAttachments) {
  _VkSubpassDescription *self = Nan::ObjectWrap::Unwrap<_VkSubpassDescription>(info.This());
  if (self->pColorAttachments.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::Object> obj = Nan::New(self->pColorAttachments);
    info.GetReturnValue().Set(obj);
  }
}NAN_SETTER(_VkSubpassDescription::SetpColorAttachments) {
  _VkSubpassDescription *self = Nan::ObjectWrap::Unwrap<_VkSubpassDescription>(info.This());
  
    // js
    if (value->IsArray()) {
      self->pColorAttachments.Reset<v8::Array>(value.As<v8::Array>());
    } else if (value->IsNull()) {
      self->pColorAttachments.Reset();
      self->instance.pColorAttachments = nullptr;
    } else {
      
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected '[object VkAttachmentReference]' for 'VkSubpassDescription.pColorAttachments' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
      return;
    }
  
  // vulkan
  if (value->IsArray()) {
    
  } else if (value->IsNull()) {
    self->instance.pColorAttachments = nullptr;
  } else {
    
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected '[object VkAttachmentReference]' for 'VkSubpassDescription.pColorAttachments' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
    return;
  }
}// pResolveAttachments
NAN_GETTER(_VkSubpassDescription::GetpResolveAttachments) {
  _VkSubpassDescription *self = Nan::ObjectWrap::Unwrap<_VkSubpassDescription>(info.This());
  if (self->pResolveAttachments.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::Object> obj = Nan::New(self->pResolveAttachments);
    info.GetReturnValue().Set(obj);
  }
}NAN_SETTER(_VkSubpassDescription::SetpResolveAttachments) {
  _VkSubpassDescription *self = Nan::ObjectWrap::Unwrap<_VkSubpassDescription>(info.This());
  
    // js
    if (value->IsArray()) {
      self->pResolveAttachments.Reset<v8::Array>(value.As<v8::Array>());
    } else if (value->IsNull()) {
      self->pResolveAttachments.Reset();
      self->instance.pResolveAttachments = nullptr;
    } else {
      
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected '[object VkAttachmentReference]' for 'VkSubpassDescription.pResolveAttachments' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
      return;
    }
  
  // vulkan
  if (value->IsArray()) {
    
  } else if (value->IsNull()) {
    self->instance.pResolveAttachments = nullptr;
  } else {
    
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected '[object VkAttachmentReference]' for 'VkSubpassDescription.pResolveAttachments' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
    return;
  }
}// pDepthStencilAttachment
NAN_GETTER(_VkSubpassDescription::GetpDepthStencilAttachment) {
  _VkSubpassDescription *self = Nan::ObjectWrap::Unwrap<_VkSubpassDescription>(info.This());
  if (self->pDepthStencilAttachment.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::Object> obj = Nan::New(self->pDepthStencilAttachment);
    info.GetReturnValue().Set(obj);
  }
}NAN_SETTER(_VkSubpassDescription::SetpDepthStencilAttachment) {
  _VkSubpassDescription *self = Nan::ObjectWrap::Unwrap<_VkSubpassDescription>(info.This());
  // js
  if (!value->IsNull()) {
    v8::Local<v8::Object> obj = Nan::To<v8::Object>(value).ToLocalChecked();
    if (Nan::New(_VkAttachmentReference::constructor)->HasInstance(obj)) {
      self->pDepthStencilAttachment.Reset<v8::Object>(value.As<v8::Object>());
      _VkAttachmentReference* inst = Nan::ObjectWrap::Unwrap<_VkAttachmentReference>(obj);
      inst->flush();
      self->instance.pDepthStencilAttachment = &inst->instance;
    } else {
      
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected '[object VkAttachmentReference]' for 'VkSubpassDescription.pDepthStencilAttachment' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
      return;
    }
  } else if (value->IsNull()) {
    self->pDepthStencilAttachment.Reset();
    self->instance.pDepthStencilAttachment = nullptr;
  } else {
    
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected '[object VkAttachmentReference]' for 'VkSubpassDescription.pDepthStencilAttachment' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
    return;
  }
}// preserveAttachmentCount
NAN_GETTER(_VkSubpassDescription::GetpreserveAttachmentCount) {
  _VkSubpassDescription *self = Nan::ObjectWrap::Unwrap<_VkSubpassDescription>(info.This());
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance.preserveAttachmentCount));
}NAN_SETTER(_VkSubpassDescription::SetpreserveAttachmentCount) {
  _VkSubpassDescription *self = Nan::ObjectWrap::Unwrap<_VkSubpassDescription>(info.This());
  if (value->IsNumber()) {
    self->instance.preserveAttachmentCount = static_cast<uint32_t>(Nan::To<int64_t>(value).FromMaybe(0));
  } else {
    
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected 'Number' for 'VkSubpassDescription.preserveAttachmentCount' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
    return;
  }
}// pPreserveAttachments
NAN_GETTER(_VkSubpassDescription::GetpPreserveAttachments) {
  _VkSubpassDescription *self = Nan::ObjectWrap::Unwrap<_VkSubpassDescription>(info.This());
  if (self->pPreserveAttachments.IsEmpty()) {
    info.GetReturnValue().SetNull();
  } else {
    v8::Local<v8::Object> obj = Nan::New(self->pPreserveAttachments);
    info.GetReturnValue().Set(obj);
  }
}NAN_SETTER(_VkSubpassDescription::SetpPreserveAttachments) {
  _VkSubpassDescription *self = Nan::ObjectWrap::Unwrap<_VkSubpassDescription>(info.This());
  
    // js
    if (value->IsArrayBufferView()) {
      if (value->IsUint32Array()) {
        self->pPreserveAttachments.Reset<v8::Array>(value.As<v8::Array>());
      } else {
        
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected 'Uint32Array' for 'VkSubpassDescription.pPreserveAttachments' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
        return;
      }
    } else if (value->IsNull()) {
      self->pPreserveAttachments.Reset();
    } else {
      
    std::string details = getV8ObjectDetails(value);
    if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
    std::string msg = "Expected 'Uint32Array' for 'VkSubpassDescription.pPreserveAttachments' but got '" + details + "'";
    Nan::ThrowTypeError(msg.c_str());
      return;
    }
  
  
  // vulkan
  if (value->IsArrayBufferView()) {
    self->instance.pPreserveAttachments = getTypedArrayData<uint32_t>(Nan::To<v8::Object>(value).ToLocalChecked(), nullptr);
  } else {
    self->instance.pPreserveAttachments = nullptr;
  }
}