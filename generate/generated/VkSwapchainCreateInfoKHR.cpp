#include "utils.h"
#include "index.h"
#include "VkSwapchainCreateInfoKHR.h"

Nan::Persistent<v8::FunctionTemplate> _VkSwapchainCreateInfoKHR::constructor;

_VkSwapchainCreateInfoKHR::_VkSwapchainCreateInfoKHR() {
  instance = (VkSwapchainCreateInfoKHR*) malloc(sizeof(VkSwapchainCreateInfoKHR));
  instance->pQueueFamilyIndices = nullptr;
}

_VkSwapchainCreateInfoKHR::~_VkSwapchainCreateInfoKHR() { }

void _VkSwapchainCreateInfoKHR::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // Constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkSwapchainCreateInfoKHR::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkSwapchainCreateInfoKHR").ToLocalChecked());

  // Prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();
  SetPrototypeAccessor(proto, Nan::New("sType").ToLocalChecked(), GetsType, SetsType, ctor);
  SetPrototypeAccessor(proto, Nan::New("surface").ToLocalChecked(), Getsurface, Setsurface, ctor);
  SetPrototypeAccessor(proto, Nan::New("minImageCount").ToLocalChecked(), GetminImageCount, SetminImageCount, ctor);
  SetPrototypeAccessor(proto, Nan::New("imageFormat").ToLocalChecked(), GetimageFormat, SetimageFormat, ctor);
  SetPrototypeAccessor(proto, Nan::New("imageColorSpace").ToLocalChecked(), GetimageColorSpace, SetimageColorSpace, ctor);
  SetPrototypeAccessor(proto, Nan::New("imageExtent").ToLocalChecked(), GetimageExtent, SetimageExtent, ctor);
  SetPrototypeAccessor(proto, Nan::New("imageArrayLayers").ToLocalChecked(), GetimageArrayLayers, SetimageArrayLayers, ctor);
  SetPrototypeAccessor(proto, Nan::New("imageUsage").ToLocalChecked(), GetimageUsage, SetimageUsage, ctor);
  SetPrototypeAccessor(proto, Nan::New("imageSharingMode").ToLocalChecked(), GetimageSharingMode, SetimageSharingMode, ctor);
  SetPrototypeAccessor(proto, Nan::New("queueFamilyIndexCount").ToLocalChecked(), GetqueueFamilyIndexCount, SetqueueFamilyIndexCount, ctor);
  SetPrototypeAccessor(proto, Nan::New("pQueueFamilyIndices").ToLocalChecked(), GetpQueueFamilyIndices, SetpQueueFamilyIndices, ctor);
  SetPrototypeAccessor(proto, Nan::New("preTransform").ToLocalChecked(), GetpreTransform, SetpreTransform, ctor);
  SetPrototypeAccessor(proto, Nan::New("compositeAlpha").ToLocalChecked(), GetcompositeAlpha, SetcompositeAlpha, ctor);
  SetPrototypeAccessor(proto, Nan::New("presentMode").ToLocalChecked(), GetpresentMode, SetpresentMode, ctor);
  SetPrototypeAccessor(proto, Nan::New("clipped").ToLocalChecked(), Getclipped, Setclipped, ctor);
  SetPrototypeAccessor(proto, Nan::New("oldSwapchain").ToLocalChecked(), GetoldSwapchain, SetoldSwapchain, ctor);
  
  Nan::Set(target, Nan::New("VkSwapchainCreateInfoKHR").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(_VkSwapchainCreateInfoKHR::New) {
  _VkSwapchainCreateInfoKHR* self = new _VkSwapchainCreateInfoKHR();
  self->Wrap(info.Holder());
  info.GetReturnValue().Set(info.Holder());
};

// sType
NAN_GETTER(_VkSwapchainCreateInfoKHR::GetsType) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->sType));
}
NAN_SETTER(_VkSwapchainCreateInfoKHR::SetsType) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  self->instance->sType = static_cast<VkStructureType>(value->Uint32Value());
}// surface
NAN_GETTER(_VkSwapchainCreateInfoKHR::Getsurface) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
}
NAN_SETTER(_VkSwapchainCreateInfoKHR::Setsurface) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
}// minImageCount
NAN_GETTER(_VkSwapchainCreateInfoKHR::GetminImageCount) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->minImageCount));
}
NAN_SETTER(_VkSwapchainCreateInfoKHR::SetminImageCount) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  self->instance->minImageCount = static_cast<uint32_t>(value->NumberValue());
}// imageFormat
NAN_GETTER(_VkSwapchainCreateInfoKHR::GetimageFormat) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->imageFormat));
}
NAN_SETTER(_VkSwapchainCreateInfoKHR::SetimageFormat) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  self->instance->imageFormat = static_cast<VkFormat>(value->Uint32Value());
}// imageColorSpace
NAN_GETTER(_VkSwapchainCreateInfoKHR::GetimageColorSpace) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->imageColorSpace));
}
NAN_SETTER(_VkSwapchainCreateInfoKHR::SetimageColorSpace) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  self->instance->imageColorSpace = static_cast<VkColorSpaceKHR>(value->Uint32Value());
}// imageExtent
NAN_GETTER(_VkSwapchainCreateInfoKHR::GetimageExtent) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  if (self->imageExtent != nullptr) {
    info.GetReturnValue().Set(self->imageExtent->handle());
  } else {
    info.GetReturnValue().SetNull();
  }
}
NAN_SETTER(_VkSwapchainCreateInfoKHR::SetimageExtent) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  _VkExtent2D* obj = Nan::ObjectWrap::Unwrap<_VkExtent2D>(value->ToObject());
  self->imageExtent = obj;
  instance->imageExtent = *obj->instance;
}// imageArrayLayers
NAN_GETTER(_VkSwapchainCreateInfoKHR::GetimageArrayLayers) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->imageArrayLayers));
}
NAN_SETTER(_VkSwapchainCreateInfoKHR::SetimageArrayLayers) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  self->instance->imageArrayLayers = static_cast<uint32_t>(value->NumberValue());
}// imageUsage
NAN_GETTER(_VkSwapchainCreateInfoKHR::GetimageUsage) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(static_cast<uint8_t>(self->instance->imageUsage)));
}
NAN_SETTER(_VkSwapchainCreateInfoKHR::SetimageUsage) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  self->instance->imageUsage = static_cast<VkImageUsageFlags>(value->Uint32Value());
}// imageSharingMode
NAN_GETTER(_VkSwapchainCreateInfoKHR::GetimageSharingMode) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->imageSharingMode));
}
NAN_SETTER(_VkSwapchainCreateInfoKHR::SetimageSharingMode) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  self->instance->imageSharingMode = static_cast<VkSharingMode>(value->Uint32Value());
}// queueFamilyIndexCount
NAN_GETTER(_VkSwapchainCreateInfoKHR::GetqueueFamilyIndexCount) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->queueFamilyIndexCount));
}
NAN_SETTER(_VkSwapchainCreateInfoKHR::SetqueueFamilyIndexCount) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  self->instance->queueFamilyIndexCount = static_cast<uint32_t>(value->NumberValue());
}// pQueueFamilyIndices
NAN_GETTER(_VkSwapchainCreateInfoKHR::GetpQueueFamilyIndices) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  if (instance->pQueueFamilyIndices != nullptr) {
    info.GetReturnValue().Set(Nan::New(self->pQueueFamilyIndices));
  } else {
    info.GetReturnValue().SetNull();
  }
}
NAN_SETTER(_VkSwapchainCreateInfoKHR::SetpQueueFamilyIndices) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  
    // js
    {
      v8::Handle<v8::Array> arr = v8::Handle<v8::Array>::Cast(value);
      Nan::Persistent<v8::Array, v8::CopyablePersistentTraits<v8::Array>> obj(arr);
      self->pQueueFamilyIndices = obj;
    }
  
  // vulkan
  {
    instance->pQueueFamilyIndices = createArrayOfV8Uint32(value);
  }
}// preTransform
NAN_GETTER(_VkSwapchainCreateInfoKHR::GetpreTransform) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(static_cast<uint8_t>(self->instance->preTransform)));
}
NAN_SETTER(_VkSwapchainCreateInfoKHR::SetpreTransform) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  self->instance->preTransform = static_cast<VkSurfaceTransformFlagBitsKHR>(value->Uint32Value());
}// compositeAlpha
NAN_GETTER(_VkSwapchainCreateInfoKHR::GetcompositeAlpha) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(static_cast<uint8_t>(self->instance->compositeAlpha)));
}
NAN_SETTER(_VkSwapchainCreateInfoKHR::SetcompositeAlpha) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  self->instance->compositeAlpha = static_cast<VkCompositeAlphaFlagBitsKHR>(value->Uint32Value());
}// presentMode
NAN_GETTER(_VkSwapchainCreateInfoKHR::GetpresentMode) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->presentMode));
}
NAN_SETTER(_VkSwapchainCreateInfoKHR::SetpresentMode) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  self->instance->presentMode = static_cast<VkPresentModeKHR>(value->Uint32Value());
}// clipped
NAN_GETTER(_VkSwapchainCreateInfoKHR::Getclipped) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->clipped));
}
NAN_SETTER(_VkSwapchainCreateInfoKHR::Setclipped) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
  self->instance->clipped = static_cast<uint32_t>(value->NumberValue());
}// oldSwapchain
NAN_GETTER(_VkSwapchainCreateInfoKHR::GetoldSwapchain) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
}
NAN_SETTER(_VkSwapchainCreateInfoKHR::SetoldSwapchain) {
  _VkSwapchainCreateInfoKHR *self = Nan::ObjectWrap::Unwrap<_VkSwapchainCreateInfoKHR>(info.This());
  VkSwapchainCreateInfoKHR *instance = self->instance;
}