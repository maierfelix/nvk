#include "utils.h"
#include "index.h"
#include "VkPhysicalDeviceFeatures.h"

Nan::Persistent<v8::FunctionTemplate> _VkPhysicalDeviceFeatures::constructor;

_VkPhysicalDeviceFeatures::_VkPhysicalDeviceFeatures() {
  instance = (VkPhysicalDeviceFeatures*) malloc(sizeof(VkPhysicalDeviceFeatures));
}

_VkPhysicalDeviceFeatures::~_VkPhysicalDeviceFeatures() { }

void _VkPhysicalDeviceFeatures::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // Constructor
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(_VkPhysicalDeviceFeatures::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("VkPhysicalDeviceFeatures").ToLocalChecked());

  // Prototype
  v8::Local<v8::ObjectTemplate> proto = ctor->PrototypeTemplate();
  SetPrototypeAccessor(proto, Nan::New("robustBufferAccess").ToLocalChecked(), GetrobustBufferAccess, SetrobustBufferAccess, ctor);
  SetPrototypeAccessor(proto, Nan::New("fullDrawIndexUint32").ToLocalChecked(), GetfullDrawIndexUint32, SetfullDrawIndexUint32, ctor);
  SetPrototypeAccessor(proto, Nan::New("imageCubeArray").ToLocalChecked(), GetimageCubeArray, SetimageCubeArray, ctor);
  SetPrototypeAccessor(proto, Nan::New("independentBlend").ToLocalChecked(), GetindependentBlend, SetindependentBlend, ctor);
  SetPrototypeAccessor(proto, Nan::New("geometryShader").ToLocalChecked(), GetgeometryShader, SetgeometryShader, ctor);
  SetPrototypeAccessor(proto, Nan::New("tessellationShader").ToLocalChecked(), GettessellationShader, SettessellationShader, ctor);
  SetPrototypeAccessor(proto, Nan::New("sampleRateShading").ToLocalChecked(), GetsampleRateShading, SetsampleRateShading, ctor);
  SetPrototypeAccessor(proto, Nan::New("dualSrcBlend").ToLocalChecked(), GetdualSrcBlend, SetdualSrcBlend, ctor);
  SetPrototypeAccessor(proto, Nan::New("logicOp").ToLocalChecked(), GetlogicOp, SetlogicOp, ctor);
  SetPrototypeAccessor(proto, Nan::New("multiDrawIndirect").ToLocalChecked(), GetmultiDrawIndirect, SetmultiDrawIndirect, ctor);
  SetPrototypeAccessor(proto, Nan::New("drawIndirectFirstInstance").ToLocalChecked(), GetdrawIndirectFirstInstance, SetdrawIndirectFirstInstance, ctor);
  SetPrototypeAccessor(proto, Nan::New("depthClamp").ToLocalChecked(), GetdepthClamp, SetdepthClamp, ctor);
  SetPrototypeAccessor(proto, Nan::New("depthBiasClamp").ToLocalChecked(), GetdepthBiasClamp, SetdepthBiasClamp, ctor);
  SetPrototypeAccessor(proto, Nan::New("fillModeNonSolid").ToLocalChecked(), GetfillModeNonSolid, SetfillModeNonSolid, ctor);
  SetPrototypeAccessor(proto, Nan::New("depthBounds").ToLocalChecked(), GetdepthBounds, SetdepthBounds, ctor);
  SetPrototypeAccessor(proto, Nan::New("wideLines").ToLocalChecked(), GetwideLines, SetwideLines, ctor);
  SetPrototypeAccessor(proto, Nan::New("largePoints").ToLocalChecked(), GetlargePoints, SetlargePoints, ctor);
  SetPrototypeAccessor(proto, Nan::New("alphaToOne").ToLocalChecked(), GetalphaToOne, SetalphaToOne, ctor);
  SetPrototypeAccessor(proto, Nan::New("multiViewport").ToLocalChecked(), GetmultiViewport, SetmultiViewport, ctor);
  SetPrototypeAccessor(proto, Nan::New("samplerAnisotropy").ToLocalChecked(), GetsamplerAnisotropy, SetsamplerAnisotropy, ctor);
  SetPrototypeAccessor(proto, Nan::New("textureCompressionETC2").ToLocalChecked(), GettextureCompressionETC2, SettextureCompressionETC2, ctor);
  SetPrototypeAccessor(proto, Nan::New("textureCompressionASTC_LDR").ToLocalChecked(), GettextureCompressionASTC_LDR, SettextureCompressionASTC_LDR, ctor);
  SetPrototypeAccessor(proto, Nan::New("textureCompressionBC").ToLocalChecked(), GettextureCompressionBC, SettextureCompressionBC, ctor);
  SetPrototypeAccessor(proto, Nan::New("occlusionQueryPrecise").ToLocalChecked(), GetocclusionQueryPrecise, SetocclusionQueryPrecise, ctor);
  SetPrototypeAccessor(proto, Nan::New("pipelineStatisticsQuery").ToLocalChecked(), GetpipelineStatisticsQuery, SetpipelineStatisticsQuery, ctor);
  SetPrototypeAccessor(proto, Nan::New("vertexPipelineStoresAndAtomics").ToLocalChecked(), GetvertexPipelineStoresAndAtomics, SetvertexPipelineStoresAndAtomics, ctor);
  SetPrototypeAccessor(proto, Nan::New("fragmentStoresAndAtomics").ToLocalChecked(), GetfragmentStoresAndAtomics, SetfragmentStoresAndAtomics, ctor);
  SetPrototypeAccessor(proto, Nan::New("shaderTessellationAndGeometryPointSize").ToLocalChecked(), GetshaderTessellationAndGeometryPointSize, SetshaderTessellationAndGeometryPointSize, ctor);
  SetPrototypeAccessor(proto, Nan::New("shaderImageGatherExtended").ToLocalChecked(), GetshaderImageGatherExtended, SetshaderImageGatherExtended, ctor);
  SetPrototypeAccessor(proto, Nan::New("shaderStorageImageExtendedFormats").ToLocalChecked(), GetshaderStorageImageExtendedFormats, SetshaderStorageImageExtendedFormats, ctor);
  SetPrototypeAccessor(proto, Nan::New("shaderStorageImageMultisample").ToLocalChecked(), GetshaderStorageImageMultisample, SetshaderStorageImageMultisample, ctor);
  SetPrototypeAccessor(proto, Nan::New("shaderStorageImageReadWithoutFormat").ToLocalChecked(), GetshaderStorageImageReadWithoutFormat, SetshaderStorageImageReadWithoutFormat, ctor);
  SetPrototypeAccessor(proto, Nan::New("shaderStorageImageWriteWithoutFormat").ToLocalChecked(), GetshaderStorageImageWriteWithoutFormat, SetshaderStorageImageWriteWithoutFormat, ctor);
  SetPrototypeAccessor(proto, Nan::New("shaderUniformBufferArrayDynamicIndexing").ToLocalChecked(), GetshaderUniformBufferArrayDynamicIndexing, SetshaderUniformBufferArrayDynamicIndexing, ctor);
  SetPrototypeAccessor(proto, Nan::New("shaderSampledImageArrayDynamicIndexing").ToLocalChecked(), GetshaderSampledImageArrayDynamicIndexing, SetshaderSampledImageArrayDynamicIndexing, ctor);
  SetPrototypeAccessor(proto, Nan::New("shaderStorageBufferArrayDynamicIndexing").ToLocalChecked(), GetshaderStorageBufferArrayDynamicIndexing, SetshaderStorageBufferArrayDynamicIndexing, ctor);
  SetPrototypeAccessor(proto, Nan::New("shaderStorageImageArrayDynamicIndexing").ToLocalChecked(), GetshaderStorageImageArrayDynamicIndexing, SetshaderStorageImageArrayDynamicIndexing, ctor);
  SetPrototypeAccessor(proto, Nan::New("shaderClipDistance").ToLocalChecked(), GetshaderClipDistance, SetshaderClipDistance, ctor);
  SetPrototypeAccessor(proto, Nan::New("shaderCullDistance").ToLocalChecked(), GetshaderCullDistance, SetshaderCullDistance, ctor);
  SetPrototypeAccessor(proto, Nan::New("shaderFloat64").ToLocalChecked(), GetshaderFloat64, SetshaderFloat64, ctor);
  SetPrototypeAccessor(proto, Nan::New("shaderInt64").ToLocalChecked(), GetshaderInt64, SetshaderInt64, ctor);
  SetPrototypeAccessor(proto, Nan::New("shaderInt16").ToLocalChecked(), GetshaderInt16, SetshaderInt16, ctor);
  SetPrototypeAccessor(proto, Nan::New("shaderResourceResidency").ToLocalChecked(), GetshaderResourceResidency, SetshaderResourceResidency, ctor);
  SetPrototypeAccessor(proto, Nan::New("shaderResourceMinLod").ToLocalChecked(), GetshaderResourceMinLod, SetshaderResourceMinLod, ctor);
  SetPrototypeAccessor(proto, Nan::New("sparseBinding").ToLocalChecked(), GetsparseBinding, SetsparseBinding, ctor);
  SetPrototypeAccessor(proto, Nan::New("sparseResidencyBuffer").ToLocalChecked(), GetsparseResidencyBuffer, SetsparseResidencyBuffer, ctor);
  SetPrototypeAccessor(proto, Nan::New("sparseResidencyImage2D").ToLocalChecked(), GetsparseResidencyImage2D, SetsparseResidencyImage2D, ctor);
  SetPrototypeAccessor(proto, Nan::New("sparseResidencyImage3D").ToLocalChecked(), GetsparseResidencyImage3D, SetsparseResidencyImage3D, ctor);
  SetPrototypeAccessor(proto, Nan::New("sparseResidency2Samples").ToLocalChecked(), GetsparseResidency2Samples, SetsparseResidency2Samples, ctor);
  SetPrototypeAccessor(proto, Nan::New("sparseResidency4Samples").ToLocalChecked(), GetsparseResidency4Samples, SetsparseResidency4Samples, ctor);
  SetPrototypeAccessor(proto, Nan::New("sparseResidency8Samples").ToLocalChecked(), GetsparseResidency8Samples, SetsparseResidency8Samples, ctor);
  SetPrototypeAccessor(proto, Nan::New("sparseResidency16Samples").ToLocalChecked(), GetsparseResidency16Samples, SetsparseResidency16Samples, ctor);
  SetPrototypeAccessor(proto, Nan::New("sparseResidencyAliased").ToLocalChecked(), GetsparseResidencyAliased, SetsparseResidencyAliased, ctor);
  SetPrototypeAccessor(proto, Nan::New("variableMultisampleRate").ToLocalChecked(), GetvariableMultisampleRate, SetvariableMultisampleRate, ctor);
  SetPrototypeAccessor(proto, Nan::New("inheritedQueries").ToLocalChecked(), GetinheritedQueries, SetinheritedQueries, ctor);
  
  Nan::Set(target, Nan::New("VkPhysicalDeviceFeatures").ToLocalChecked(), ctor->GetFunction());
}

NAN_METHOD(_VkPhysicalDeviceFeatures::New) {
  _VkPhysicalDeviceFeatures* self = new _VkPhysicalDeviceFeatures();
  self->Wrap(info.Holder());
  info.GetReturnValue().Set(info.Holder());
};

// robustBufferAccess
NAN_GETTER(_VkPhysicalDeviceFeatures::GetrobustBufferAccess) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->robustBufferAccess));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetrobustBufferAccess) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->robustBufferAccess = static_cast<uint32_t>(value->NumberValue());
}// fullDrawIndexUint32
NAN_GETTER(_VkPhysicalDeviceFeatures::GetfullDrawIndexUint32) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->fullDrawIndexUint32));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetfullDrawIndexUint32) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->fullDrawIndexUint32 = static_cast<uint32_t>(value->NumberValue());
}// imageCubeArray
NAN_GETTER(_VkPhysicalDeviceFeatures::GetimageCubeArray) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->imageCubeArray));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetimageCubeArray) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->imageCubeArray = static_cast<uint32_t>(value->NumberValue());
}// independentBlend
NAN_GETTER(_VkPhysicalDeviceFeatures::GetindependentBlend) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->independentBlend));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetindependentBlend) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->independentBlend = static_cast<uint32_t>(value->NumberValue());
}// geometryShader
NAN_GETTER(_VkPhysicalDeviceFeatures::GetgeometryShader) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->geometryShader));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetgeometryShader) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->geometryShader = static_cast<uint32_t>(value->NumberValue());
}// tessellationShader
NAN_GETTER(_VkPhysicalDeviceFeatures::GettessellationShader) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->tessellationShader));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SettessellationShader) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->tessellationShader = static_cast<uint32_t>(value->NumberValue());
}// sampleRateShading
NAN_GETTER(_VkPhysicalDeviceFeatures::GetsampleRateShading) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->sampleRateShading));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetsampleRateShading) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->sampleRateShading = static_cast<uint32_t>(value->NumberValue());
}// dualSrcBlend
NAN_GETTER(_VkPhysicalDeviceFeatures::GetdualSrcBlend) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->dualSrcBlend));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetdualSrcBlend) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->dualSrcBlend = static_cast<uint32_t>(value->NumberValue());
}// logicOp
NAN_GETTER(_VkPhysicalDeviceFeatures::GetlogicOp) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->logicOp));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetlogicOp) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->logicOp = static_cast<uint32_t>(value->NumberValue());
}// multiDrawIndirect
NAN_GETTER(_VkPhysicalDeviceFeatures::GetmultiDrawIndirect) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->multiDrawIndirect));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetmultiDrawIndirect) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->multiDrawIndirect = static_cast<uint32_t>(value->NumberValue());
}// drawIndirectFirstInstance
NAN_GETTER(_VkPhysicalDeviceFeatures::GetdrawIndirectFirstInstance) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->drawIndirectFirstInstance));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetdrawIndirectFirstInstance) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->drawIndirectFirstInstance = static_cast<uint32_t>(value->NumberValue());
}// depthClamp
NAN_GETTER(_VkPhysicalDeviceFeatures::GetdepthClamp) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->depthClamp));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetdepthClamp) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->depthClamp = static_cast<uint32_t>(value->NumberValue());
}// depthBiasClamp
NAN_GETTER(_VkPhysicalDeviceFeatures::GetdepthBiasClamp) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->depthBiasClamp));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetdepthBiasClamp) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->depthBiasClamp = static_cast<uint32_t>(value->NumberValue());
}// fillModeNonSolid
NAN_GETTER(_VkPhysicalDeviceFeatures::GetfillModeNonSolid) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->fillModeNonSolid));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetfillModeNonSolid) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->fillModeNonSolid = static_cast<uint32_t>(value->NumberValue());
}// depthBounds
NAN_GETTER(_VkPhysicalDeviceFeatures::GetdepthBounds) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->depthBounds));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetdepthBounds) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->depthBounds = static_cast<uint32_t>(value->NumberValue());
}// wideLines
NAN_GETTER(_VkPhysicalDeviceFeatures::GetwideLines) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->wideLines));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetwideLines) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->wideLines = static_cast<uint32_t>(value->NumberValue());
}// largePoints
NAN_GETTER(_VkPhysicalDeviceFeatures::GetlargePoints) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->largePoints));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetlargePoints) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->largePoints = static_cast<uint32_t>(value->NumberValue());
}// alphaToOne
NAN_GETTER(_VkPhysicalDeviceFeatures::GetalphaToOne) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->alphaToOne));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetalphaToOne) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->alphaToOne = static_cast<uint32_t>(value->NumberValue());
}// multiViewport
NAN_GETTER(_VkPhysicalDeviceFeatures::GetmultiViewport) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->multiViewport));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetmultiViewport) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->multiViewport = static_cast<uint32_t>(value->NumberValue());
}// samplerAnisotropy
NAN_GETTER(_VkPhysicalDeviceFeatures::GetsamplerAnisotropy) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->samplerAnisotropy));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetsamplerAnisotropy) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->samplerAnisotropy = static_cast<uint32_t>(value->NumberValue());
}// textureCompressionETC2
NAN_GETTER(_VkPhysicalDeviceFeatures::GettextureCompressionETC2) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->textureCompressionETC2));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SettextureCompressionETC2) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->textureCompressionETC2 = static_cast<uint32_t>(value->NumberValue());
}// textureCompressionASTC_LDR
NAN_GETTER(_VkPhysicalDeviceFeatures::GettextureCompressionASTC_LDR) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->textureCompressionASTC_LDR));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SettextureCompressionASTC_LDR) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->textureCompressionASTC_LDR = static_cast<uint32_t>(value->NumberValue());
}// textureCompressionBC
NAN_GETTER(_VkPhysicalDeviceFeatures::GettextureCompressionBC) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->textureCompressionBC));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SettextureCompressionBC) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->textureCompressionBC = static_cast<uint32_t>(value->NumberValue());
}// occlusionQueryPrecise
NAN_GETTER(_VkPhysicalDeviceFeatures::GetocclusionQueryPrecise) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->occlusionQueryPrecise));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetocclusionQueryPrecise) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->occlusionQueryPrecise = static_cast<uint32_t>(value->NumberValue());
}// pipelineStatisticsQuery
NAN_GETTER(_VkPhysicalDeviceFeatures::GetpipelineStatisticsQuery) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->pipelineStatisticsQuery));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetpipelineStatisticsQuery) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->pipelineStatisticsQuery = static_cast<uint32_t>(value->NumberValue());
}// vertexPipelineStoresAndAtomics
NAN_GETTER(_VkPhysicalDeviceFeatures::GetvertexPipelineStoresAndAtomics) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->vertexPipelineStoresAndAtomics));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetvertexPipelineStoresAndAtomics) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->vertexPipelineStoresAndAtomics = static_cast<uint32_t>(value->NumberValue());
}// fragmentStoresAndAtomics
NAN_GETTER(_VkPhysicalDeviceFeatures::GetfragmentStoresAndAtomics) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->fragmentStoresAndAtomics));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetfragmentStoresAndAtomics) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->fragmentStoresAndAtomics = static_cast<uint32_t>(value->NumberValue());
}// shaderTessellationAndGeometryPointSize
NAN_GETTER(_VkPhysicalDeviceFeatures::GetshaderTessellationAndGeometryPointSize) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->shaderTessellationAndGeometryPointSize));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetshaderTessellationAndGeometryPointSize) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->shaderTessellationAndGeometryPointSize = static_cast<uint32_t>(value->NumberValue());
}// shaderImageGatherExtended
NAN_GETTER(_VkPhysicalDeviceFeatures::GetshaderImageGatherExtended) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->shaderImageGatherExtended));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetshaderImageGatherExtended) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->shaderImageGatherExtended = static_cast<uint32_t>(value->NumberValue());
}// shaderStorageImageExtendedFormats
NAN_GETTER(_VkPhysicalDeviceFeatures::GetshaderStorageImageExtendedFormats) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->shaderStorageImageExtendedFormats));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetshaderStorageImageExtendedFormats) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->shaderStorageImageExtendedFormats = static_cast<uint32_t>(value->NumberValue());
}// shaderStorageImageMultisample
NAN_GETTER(_VkPhysicalDeviceFeatures::GetshaderStorageImageMultisample) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->shaderStorageImageMultisample));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetshaderStorageImageMultisample) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->shaderStorageImageMultisample = static_cast<uint32_t>(value->NumberValue());
}// shaderStorageImageReadWithoutFormat
NAN_GETTER(_VkPhysicalDeviceFeatures::GetshaderStorageImageReadWithoutFormat) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->shaderStorageImageReadWithoutFormat));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetshaderStorageImageReadWithoutFormat) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->shaderStorageImageReadWithoutFormat = static_cast<uint32_t>(value->NumberValue());
}// shaderStorageImageWriteWithoutFormat
NAN_GETTER(_VkPhysicalDeviceFeatures::GetshaderStorageImageWriteWithoutFormat) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->shaderStorageImageWriteWithoutFormat));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetshaderStorageImageWriteWithoutFormat) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->shaderStorageImageWriteWithoutFormat = static_cast<uint32_t>(value->NumberValue());
}// shaderUniformBufferArrayDynamicIndexing
NAN_GETTER(_VkPhysicalDeviceFeatures::GetshaderUniformBufferArrayDynamicIndexing) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->shaderUniformBufferArrayDynamicIndexing));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetshaderUniformBufferArrayDynamicIndexing) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->shaderUniformBufferArrayDynamicIndexing = static_cast<uint32_t>(value->NumberValue());
}// shaderSampledImageArrayDynamicIndexing
NAN_GETTER(_VkPhysicalDeviceFeatures::GetshaderSampledImageArrayDynamicIndexing) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->shaderSampledImageArrayDynamicIndexing));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetshaderSampledImageArrayDynamicIndexing) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->shaderSampledImageArrayDynamicIndexing = static_cast<uint32_t>(value->NumberValue());
}// shaderStorageBufferArrayDynamicIndexing
NAN_GETTER(_VkPhysicalDeviceFeatures::GetshaderStorageBufferArrayDynamicIndexing) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->shaderStorageBufferArrayDynamicIndexing));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetshaderStorageBufferArrayDynamicIndexing) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->shaderStorageBufferArrayDynamicIndexing = static_cast<uint32_t>(value->NumberValue());
}// shaderStorageImageArrayDynamicIndexing
NAN_GETTER(_VkPhysicalDeviceFeatures::GetshaderStorageImageArrayDynamicIndexing) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->shaderStorageImageArrayDynamicIndexing));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetshaderStorageImageArrayDynamicIndexing) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->shaderStorageImageArrayDynamicIndexing = static_cast<uint32_t>(value->NumberValue());
}// shaderClipDistance
NAN_GETTER(_VkPhysicalDeviceFeatures::GetshaderClipDistance) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->shaderClipDistance));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetshaderClipDistance) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->shaderClipDistance = static_cast<uint32_t>(value->NumberValue());
}// shaderCullDistance
NAN_GETTER(_VkPhysicalDeviceFeatures::GetshaderCullDistance) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->shaderCullDistance));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetshaderCullDistance) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->shaderCullDistance = static_cast<uint32_t>(value->NumberValue());
}// shaderFloat64
NAN_GETTER(_VkPhysicalDeviceFeatures::GetshaderFloat64) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->shaderFloat64));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetshaderFloat64) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->shaderFloat64 = static_cast<uint32_t>(value->NumberValue());
}// shaderInt64
NAN_GETTER(_VkPhysicalDeviceFeatures::GetshaderInt64) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->shaderInt64));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetshaderInt64) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->shaderInt64 = static_cast<uint32_t>(value->NumberValue());
}// shaderInt16
NAN_GETTER(_VkPhysicalDeviceFeatures::GetshaderInt16) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->shaderInt16));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetshaderInt16) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->shaderInt16 = static_cast<uint32_t>(value->NumberValue());
}// shaderResourceResidency
NAN_GETTER(_VkPhysicalDeviceFeatures::GetshaderResourceResidency) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->shaderResourceResidency));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetshaderResourceResidency) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->shaderResourceResidency = static_cast<uint32_t>(value->NumberValue());
}// shaderResourceMinLod
NAN_GETTER(_VkPhysicalDeviceFeatures::GetshaderResourceMinLod) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->shaderResourceMinLod));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetshaderResourceMinLod) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->shaderResourceMinLod = static_cast<uint32_t>(value->NumberValue());
}// sparseBinding
NAN_GETTER(_VkPhysicalDeviceFeatures::GetsparseBinding) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->sparseBinding));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetsparseBinding) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->sparseBinding = static_cast<uint32_t>(value->NumberValue());
}// sparseResidencyBuffer
NAN_GETTER(_VkPhysicalDeviceFeatures::GetsparseResidencyBuffer) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->sparseResidencyBuffer));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetsparseResidencyBuffer) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->sparseResidencyBuffer = static_cast<uint32_t>(value->NumberValue());
}// sparseResidencyImage2D
NAN_GETTER(_VkPhysicalDeviceFeatures::GetsparseResidencyImage2D) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->sparseResidencyImage2D));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetsparseResidencyImage2D) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->sparseResidencyImage2D = static_cast<uint32_t>(value->NumberValue());
}// sparseResidencyImage3D
NAN_GETTER(_VkPhysicalDeviceFeatures::GetsparseResidencyImage3D) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->sparseResidencyImage3D));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetsparseResidencyImage3D) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->sparseResidencyImage3D = static_cast<uint32_t>(value->NumberValue());
}// sparseResidency2Samples
NAN_GETTER(_VkPhysicalDeviceFeatures::GetsparseResidency2Samples) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->sparseResidency2Samples));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetsparseResidency2Samples) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->sparseResidency2Samples = static_cast<uint32_t>(value->NumberValue());
}// sparseResidency4Samples
NAN_GETTER(_VkPhysicalDeviceFeatures::GetsparseResidency4Samples) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->sparseResidency4Samples));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetsparseResidency4Samples) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->sparseResidency4Samples = static_cast<uint32_t>(value->NumberValue());
}// sparseResidency8Samples
NAN_GETTER(_VkPhysicalDeviceFeatures::GetsparseResidency8Samples) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->sparseResidency8Samples));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetsparseResidency8Samples) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->sparseResidency8Samples = static_cast<uint32_t>(value->NumberValue());
}// sparseResidency16Samples
NAN_GETTER(_VkPhysicalDeviceFeatures::GetsparseResidency16Samples) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->sparseResidency16Samples));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetsparseResidency16Samples) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->sparseResidency16Samples = static_cast<uint32_t>(value->NumberValue());
}// sparseResidencyAliased
NAN_GETTER(_VkPhysicalDeviceFeatures::GetsparseResidencyAliased) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->sparseResidencyAliased));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetsparseResidencyAliased) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->sparseResidencyAliased = static_cast<uint32_t>(value->NumberValue());
}// variableMultisampleRate
NAN_GETTER(_VkPhysicalDeviceFeatures::GetvariableMultisampleRate) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->variableMultisampleRate));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetvariableMultisampleRate) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->variableMultisampleRate = static_cast<uint32_t>(value->NumberValue());
}// inheritedQueries
NAN_GETTER(_VkPhysicalDeviceFeatures::GetinheritedQueries) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  info.GetReturnValue().Set(Nan::New<v8::Number>(self->instance->inheritedQueries));
}
NAN_SETTER(_VkPhysicalDeviceFeatures::SetinheritedQueries) {
  _VkPhysicalDeviceFeatures *self = Nan::ObjectWrap::Unwrap<_VkPhysicalDeviceFeatures>(info.This());
  VkPhysicalDeviceFeatures *instance = self->instance;
  self->instance->inheritedQueries = static_cast<uint32_t>(value->NumberValue());
}