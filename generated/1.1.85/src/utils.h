/*
 * MACHINE GENERATED, DO NOT EDIT
 * GENERATED BY nvk v0.1.6
 */
#ifndef __UTILS__
#define __UTILS__

#include <nan.h>
#include "index.h"

#define VULKAN_ASSERT(func) { VkResult res = func; TRAP(res >= VK_SUCCESS); }

inline void SetPrototypeAccessor(
  v8::Local<v8::ObjectTemplate> tpl,
  v8::Local<v8::String> name,
  Nan::GetterCallback getter,
  Nan::SetterCallback setter,
  v8::Local<v8::FunctionTemplate> ctor
) {
  Nan::SetAccessor(
    tpl,
    name,
    getter,
    setter,
    v8::Local<v8::Value>(),
    v8::DEFAULT,
    v8::None,
    v8::AccessorSignature::New(v8::Isolate::GetCurrent(), ctor)
  );
};

std::string getV8ObjectDetails(v8::Local<v8::Value> value) {
  Nan::Utf8String utf8(value->ToDetailString(Nan::GetCurrentContext()).ToLocalChecked());
  std::string details(*utf8);
  return details;
};

template<typename T> inline std::vector<T> createArrayOfV8Numbers(v8::Local<v8::Value> value) {
  v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(value);
  std::vector<T> data(array->Length());
  for (unsigned int ii = 0; ii < array->Length(); ++ii) {
    v8::Local<v8::Value> item = Nan::Get(array, ii).ToLocalChecked();
    T num = static_cast<T>(Nan::To<double>(item).FromMaybe(0));
    data[ii] = num;
  };
  return data;
};

inline char* copyV8String(v8::Handle<v8::Value> val) {
  Nan::Utf8String utf8(Nan::To<v8::String>(val).ToLocalChecked());
  int len = utf8.length() + 1;
  char *str = new char[len];
  strncpy(str, *utf8, len);
  return str;
};

template<typename T> inline T* getTypedArrayData(v8::Local<v8::Object> obj, int *len = nullptr) {
  T *data = nullptr;
  if (len) *len = 0;
  if (!obj->IsArrayBufferView()) {
    Nan::ThrowError("Argument must be an ArrayBufferView");
    return data;
  }
  v8::Local<v8::ArrayBufferView> arr = v8::Local<v8::ArrayBufferView>::Cast(obj);
  if (len) *len = arr->ByteLength() / sizeof(T);
  data = reinterpret_cast<T*>(arr->Buffer()->GetContents().Data());
  return data;
};

void NanInvalidStructMemberTypeError(
  v8::Local<v8::Value> value,
  std::string memberName,
  std::string expectedType
) {
  std::string details = getV8ObjectDetails(value);
  if (details[0] == '#') details = "[object " + (details.substr(2, details.length() - 2 - 1)) + "]";
  std::string msg = "Expected '" + expectedType + "' for '" + memberName + "' but got '" + details + "'";
  Nan::ThrowTypeError(msg.c_str());
}

#endif
