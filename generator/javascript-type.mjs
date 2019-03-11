import {
  warn,
  isIgnoreableType,
  getBitmaskByName,
  getNumericByteLength
} from "./utils";

// 64-bit system
const PTR_SIZE = 8;

export class JavaScriptType {
  constructor(opts) {
    this.type = null;
    this.value = null;
    this.isArray = false;
    this.isEnum = false;
    this.isBitmask = false;
    this.isNullable = false;
    this.byteLength = 0;
    if (opts.type !== void 0) this.type = opts.type;
    if (opts.value !== void 0) this.value = opts.value;
    if (opts.isArray !== void 0) this.isArray = opts.isArray;
    if (opts.isEnum !== void 0) this.isEnum = opts.isEnum;
    if (opts.isBitmask !== void 0) this.isBitmask = opts.isBitmask;
    if (opts.isNullable !== void 0) this.isNullable = opts.isNullable;
    if (opts.byteLength !== void 0) this.byteLength = opts.byteLength;
    //if (!opts.byteLength) console.log("nooooo");
  }
  get isNumeric() {
    return (
      this.type === JavaScriptType.NUMBER ||
      this.type === JavaScriptType.BIGINT
    );
  }
};

// static types
{
  let idx = 0;
  JavaScriptType.UNKNOWN = idx++;
  JavaScriptType.OBJECT = idx++;
  JavaScriptType.NULL = idx++;
  JavaScriptType.STRING = idx++;
  JavaScriptType.NUMBER = idx++;
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
      isNullable: true,
      byteLength: PTR_SIZE
    });
  }
  if (object.isFunction) {
    return new JavaScriptType({
      type: JavaScriptType.FUNCTION,
      value: object.type,
      isNullable: true,
      byteLength: PTR_SIZE
    });
  }
  if (isIgnoreableType(object)) {
    return new JavaScriptType({
      type: JavaScriptType.NULL,
      isNullable: true,
      byteLength: PTR_SIZE
    });
  }
  if (object.kind === "COMMAND_PARAM") {
    // handle inout parameters
    switch (object.rawType) {
      case "size_t *":
      case "int *":
      case "int32_t *":
      case "uint32_t *":
      case "uint64_t *":
      case "VkBool32 *":
        return new JavaScriptType({
          type: JavaScriptType.OBJECT_INOUT,
          value: "Number",
          isNullable: true,
          byteLength: PTR_SIZE
        });
    };
  }
  if (object.isBaseType) rawType = object.baseType;
  if (object.enumType) {
    return new JavaScriptType({
      type: JavaScriptType.NUMBER,
      value: object.enumType,
      isNullable: false,
      isEnum: true,
      byteLength: getNumericByteLength(object.rawType)
    });
  }
  if (object.isBitmaskType) {
    let bitmask = getBitmaskByName(ast, object.bitmaskType);
    // future reserved bitmask, or must be 0
    if (!bitmask) {
      return new JavaScriptType({
        type: JavaScriptType.NUMBER,
        isNullable: false,
        byteLength: getNumericByteLength(object.rawType)
      });
    }
    return new JavaScriptType({
      type: JavaScriptType.NUMBER,
      value: object.bitmaskType,
      isNullable: false,
      isBitmask: true,
      byteLength: getNumericByteLength(object.rawType)
    });
  }
  if (object.isStaticArray) {
    // string of chars
    if (object.type === "char" && object.isStaticArray) {
      return new JavaScriptType({
        type: JavaScriptType.STRING,
        isArray: true,
        isNullable: true,
        byteLength: parseInt(object.length)
      });
    }
    else {
      return new JavaScriptType({
        type: JavaScriptType.ARRAY_OF_NUMBERS,
        isArray: true,
        isNullable: true,
        byteLength: parseInt(object.length)
      });
    }
  }
  if (object.isArray && (object.isStructType || object.isHandleType)) {
    return new JavaScriptType({
      type: JavaScriptType.ARRAY_OF_OBJECTS,
      value: object.type,
      isArray: true,
      isNullable: true,
      byteLength: PTR_SIZE
    });
  }
  if (object.isStructType || object.isHandleType || object.isBaseType) {
    if (object.isStructType || object.isHandleType || object.dereferenceCount > 0) {
      return new JavaScriptType({
        type: JavaScriptType.OBJECT,
        value: object.type,
        isNullable: true,
        byteLength: PTR_SIZE
      });
    }
  }
  if (object.isWin32Handle) {
    return new JavaScriptType({
      type: JavaScriptType.BIGINT,
      isNullable: false,
      byteLength: PTR_SIZE
    });
  }
  if (object.isWin32HandleReference) {
    return new JavaScriptType({
      type: JavaScriptType.OBJECT_INOUT,
      value: "BigInt",
      isNullable: true,
      byteLength: PTR_SIZE
    });
  }
  switch (rawType) {
    case "void *":
    case "const void *":
      return new JavaScriptType({
        type: JavaScriptType.NULL,
        isNullable: true,
        byteLength: PTR_SIZE
      });
    case "LPCWSTR":
    case "const char *":
      return new JavaScriptType({
        type: JavaScriptType.STRING,
        isNullable: true,
        byteLength: PTR_SIZE
      });
    case "const char * const*":
      return new JavaScriptType({
        type: JavaScriptType.ARRAY_OF_STRINGS,
        isArray: true,
        isNullable: true,
        byteLength: PTR_SIZE
      });
    case "int":
    case "float":
    case "size_t":
    case "int32_t":
    case "uint8_t":
    case "uint16_t":
    case "uint32_t":
    case "uint64_t":
      return new JavaScriptType({
        type: JavaScriptType.NUMBER,
        isNullable: false,
        byteLength: getNumericByteLength(object.rawType)
      });
    case "void **":
      return new JavaScriptType({
        type: JavaScriptType.OBJECT_INOUT,
        value: "BigInt",
        isNullable: true,
        byteLength: PTR_SIZE
      });
  };
  warn(`Cannot handle object ${object.rawType} in JavaScript type resolver!`);
  return null;
};
