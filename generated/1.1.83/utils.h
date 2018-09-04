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

inline char* copyV8String(v8::Handle<v8::Value> val) {
  v8::String::Utf8Value utf8(val->ToString());
  int len = utf8.length() + 1;
  char *str = (char *) calloc(sizeof(char), len);
  strncpy(str, *utf8, len);
  return str;
};

inline const char** createArrayOfV8Strings(v8::Local<v8::Value> value) {
  v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(value);
  std::vector<const char *> data;
  for (unsigned int ii = 0; ii < array->Length(); ++ii) {
    char *copy = copyV8String(Nan::Get(array, ii).ToLocalChecked());
    data.push_back(copy);
  };
  return data.data();
};

inline int32_t* createArrayOfV8Int32(v8::Local<v8::Value> value) {
  v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(value);
  std::vector<int32_t> data;
  for (unsigned int ii = 0; ii < array->Length(); ++ii) {
    int32_t num = static_cast<int32_t>(Nan::Get(array, ii).ToLocalChecked()->NumberValue());
    data.push_back(num);
  };
  return data.data();
};

inline uint32_t* createArrayOfV8Uint32(v8::Local<v8::Value> value) {
  v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(value);
  std::vector<uint32_t> data;
  for (unsigned int ii = 0; ii < array->Length(); ++ii) {
    uint32_t num = Nan::Get(array, ii).ToLocalChecked()->Uint32Value();
    data.push_back(num);
  };
  return data.data();
};

inline uint64_t* createArrayOfV8Uint64(v8::Local<v8::Value> value) {
  v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(value);
  std::vector<uint64_t> data;
  for (unsigned int ii = 0; ii < array->Length(); ++ii) {
    uint64_t num = static_cast<uint64_t>(Nan::Get(array, ii).ToLocalChecked()->NumberValue());
    data.push_back(num);
  };
  return data.data();
};

inline float* createArrayOfV8Floats(v8::Local<v8::Value> value) {
  v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(value);
  std::vector<float> data;
  for (unsigned int ii = 0; ii < array->Length(); ++ii) {
    float num = static_cast<float>(Nan::Get(array, ii).ToLocalChecked()->NumberValue());
    data.push_back(num);
  };
  return data.data();
};

template<typename S, typename T>
inline const S* createArrayOfV8Objects(v8::Local<v8::Value> value) {
  v8::Local<v8::Array> array = v8::Local<v8::Array>::Cast(value);
  std::vector<S> data;
  for (unsigned int ii = 0; ii < array->Length(); ++ii) {
    v8::Handle<v8::Value> item = Nan::Get(array, ii).ToLocalChecked();
    T* result = Nan::ObjectWrap::Unwrap<T>(item->ToObject());
    data.push_back(*result->instance);
  };
  return data.data();
};
