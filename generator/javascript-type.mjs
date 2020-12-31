import {
  warn,
  isIgnoreableType,
  getBitmaskByName
} from "./utils.mjs";

export class JavaScriptType {
  constructor(opts) {
    this.type = -1;
    this.value = null;
    this.isEnum = false;
    this.isBitmask = false;
    this.isNullable = false;
    this.isStatic = false;
    this.isReference = false;
    if (opts.type !== void 0) this.type = opts.type;
    if (opts.value !== void 0) this.value = opts.value;
    if (opts.isEnum !== void 0) this.isEnum = opts.isEnum;
    if (opts.isBitmask !== void 0) this.isBitmask = opts.isBitmask;
    if (opts.isNullable !== void 0) this.isNullable = opts.isNullable;
    if (opts.isStatic !== void 0) this.isStatic = opts.isStatic;
    if (opts.isReference !== void 0) this.isReference = opts.isReference;
    if (opts.isHandle !== void 0) this.isHandle = opts.isHandle;
    if (opts.isStruct !== void 0) this.isStruct = opts.isStruct;
    //if (!opts.byteLength) console.log("nooooo");
  }
  toString() {
    for (let key in JavaScriptType) {
      if (JavaScriptType[key] === this.type) {
        return this.constructor.name + "." + key;
      }
    };
    return `UNKNOWN`;
  }
  get isNumeric() {
    let {type} = this;
    return (
      type === JavaScriptType.NUMBER ||
      type === JavaScriptType.BIGINT
    );
  }
  get isString() {
    let {type} = this;
    return (
      type === JavaScriptType.STRING
    );
  }
  get isArray() {
    let {type} = this;
    return (
      this.isTypedArray ||
      this.isJavaScriptArray
    );
  }
  get isJavaScriptArray() {
    let {type} = this;
    return (
      type === JavaScriptType.ARRAY_OF_STRINGS ||
      type === JavaScriptType.ARRAY_OF_NUMBERS ||
      type === JavaScriptType.ARRAY_OF_OBJECTS
    );
  }
  get isTypedArray() {
    let {type} = this;
    return (
      type === JavaScriptType.TYPED_ARRAY
    );
  }
  get isArrayBuffer() {
    return (
      this.isTypedArray &&
      this.value === "ArrayBuffer"
    );
  }
  get isBoolean() {
    let {type} = this;
    return (
      type === JavaScriptType.BOOLEAN
    );
  }
  get isFunction() {
    let {type} = this;
    return (
      type === JavaScriptType.FUNCTION
    );
  }
};

// static types
{
  let idx = 0;
  JavaScriptType.UNKNOWN = idx++;
  JavaScriptType.OBJECT = idx++;
  JavaScriptType.NULL = idx++;
  JavaScriptType.UNDEFINED = idx++;
  JavaScriptType.STRING = idx++;
  JavaScriptType.NUMBER = idx++;
  JavaScriptType.BOOLEAN = idx++;
  JavaScriptType.BIGINT = idx++;
  JavaScriptType.OBJECT_INOUT = idx++;
  JavaScriptType.TYPED_ARRAY = idx++;
  JavaScriptType.FUNCTION = idx++;
  JavaScriptType.ARRAY_OF_STRINGS = idx++;
  JavaScriptType.ARRAY_OF_NUMBERS = idx++;
  JavaScriptType.ARRAY_OF_OBJECTS = idx++;
}

export function getJavaScriptType(ast, object) {
  let {rawType} = object;
  if (object.isTypedArray) {
    return new JavaScriptType({
      type: JavaScriptType.TYPED_ARRAY,
      value: object.jsTypedArrayName,
      isArray: true,
      isNullable: true
    });
  }
  if (object.isFunction) {
    return new JavaScriptType({
      type: JavaScriptType.FUNCTION,
      value: object.type,
      isNullable: true
    });
  }
  if (isIgnoreableType(object)) {
    return new JavaScriptType({
      type: JavaScriptType.NULL,
      isNullable: true
    });
  }
  if (object.kind === "COMMAND_PARAM") {
    // handle inout parameters
    switch (object.rawType) {
      case "size_t *":
      case "int64_t *":
      case "uint64_t *":
        return new JavaScriptType({
          type: JavaScriptType.OBJECT_INOUT,
          value: "BigInt",
          isNullable: true
        });
      case "int *":
      case "int8_t *":
      case "int16_t *":
      case "int32_t *":
      case "uint8_t *":
      case "uint16_t *":
      case "uint32_t *":
      case "VkBool32 *":
        return new JavaScriptType({
          type: JavaScriptType.OBJECT_INOUT,
          value: "Number",
          isNullable: true
        });
    };
  }
  if (object.isBaseType) rawType = object.baseType;
  if (object.isBoolean) {
    return new JavaScriptType({
      type: JavaScriptType.BOOLEAN
    });
  }
  if (object.enumType && !object.isBitmaskType && !object.isStaticArray) {
    return new JavaScriptType({
      type: JavaScriptType.NUMBER,
      value: object.enumType,
      isEnum: true
    });
  }
  if (object.isBitmaskType && !object.isStaticArray) {
    let bitmask = getBitmaskByName(ast, object.bitmaskType);
    // future reserved bitmask, or must be 0
    if (!bitmask) {
      return new JavaScriptType({
        type: JavaScriptType.NUMBER
      });
    }
    return new JavaScriptType({
      type: JavaScriptType.NUMBER,
      value: object.bitmaskType,
      isBitmask: true
    });
  }
  if (object.isStaticArray) {
    // string of chars
    if (object.type === "char" && object.isStaticArray) {
      return new JavaScriptType({
        type: JavaScriptType.STRING,
        isNullable: true,
        isStatic: true
      });
    } else if (object.isNumericArray) {
      return new JavaScriptType({
        type: JavaScriptType.ARRAY_OF_NUMBERS,
        isArray: true,
        isNullable: true,
        isStatic: true
      });
    }
  }
  if (object.isArray && (object.isStructType || object.isHandleType)) {
    return new JavaScriptType({
      type: JavaScriptType.ARRAY_OF_OBJECTS,
      value: object.type,
      isArray: true,
      isNullable: true,
      isStatic: object.isStaticArray,
      isStruct: object.isStructType,
      isHandle: object.isHandleType
    });
  }
  if (object.isStructType || object.isHandleType || object.isBaseType) {
    if (object.isStructType || object.isHandleType || object.dereferenceCount > 0) {
      return new JavaScriptType({
        type: JavaScriptType.OBJECT,
        value: object.type,
        isNullable: true,
        isReference: object.dereferenceCount > 0,
        isStruct: object.isStructType,
        isHandle: object.isHandleType
      });
    }
  }
  if (object.isWin32Handle) {
    return new JavaScriptType({
      type: JavaScriptType.BIGINT,
      isNullable: false
    });
  }
  if (object.isWin32HandleReference) {
    return new JavaScriptType({
      type: JavaScriptType.OBJECT_INOUT,
      value: "BigInt",
      isNullable: true
    });
  }
  switch (rawType) {
    case "void":
      return new JavaScriptType({
        type: JavaScriptType.UNDEFINED
      });
    case "void *":
    case "const void *":
      return new JavaScriptType({
        type: JavaScriptType.NULL,
        isNullable: true
      });
    case "LPCWSTR":
    case "const char *":
      return new JavaScriptType({
        type: JavaScriptType.STRING,
        isNullable: true
      });
    case "const char * const*":
      return new JavaScriptType({
        type: JavaScriptType.ARRAY_OF_STRINGS,
        isArray: true,
        isNullable: true
      });
    case "double":
    case "size_t":
    case "int64_t":
    case "uint64_t":
      return new JavaScriptType({
        type: JavaScriptType.BIGINT
      });
    case "int":
    case "float":
    case "int8_t":
    case "int16_t":
    case "int32_t":
    case "uint8_t":
    case "uint16_t":
    case "uint32_t":
    case "DWORD":
      return new JavaScriptType({
        type: JavaScriptType.NUMBER
      });
    case "void **":
      return new JavaScriptType({
        type: JavaScriptType.OBJECT_INOUT,
        value: "BigInt",
        isNullable: true
      });
    // TODO: bad
    case "const uint32_t * const*":
      return new JavaScriptType({
        type: JavaScriptType.BIGINT
      });
  };
  warn(`Cannot handle object ${object.rawType} in JavaScript type resolver!`);
  return null;
};
