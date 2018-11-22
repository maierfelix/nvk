/** VkApplicationInfo */
interface VkApplicationInfoInitializer {
  sType?: number
  pNext?: null
  pApplicationName?: string | null
  applicationVersion?: number
  pEngineName?: string | null
  engineVersion?: number
  apiVersion?: number
}

declare var VkApplicationInfo: {
  prototype: VkApplicationInfo;
  new(param?: VkApplicationInfoInitializer | null): VkApplicationInfo;
  sType: number;
  pNext: null;
  pApplicationName: string | null;
  applicationVersion: number;
  pEngineName: string | null;
  engineVersion: number;
  apiVersion: number;
}

interface VkApplicationInfo {
  sType: number;
  pNext: null;
  pApplicationName: string | null;
  applicationVersion: number;
  pEngineName: string | null;
  engineVersion: number;
  apiVersion: number;
}

/** VkInstanceCreateInfo */
interface VkInstanceCreateInfoInitializer {
  sType?: number;
  pNext?: null;
  flags?: number;
  pApplicationInfo?: VkApplicationInfo | null;
  enabledLayerCount?: number;
  ppEnabledLayerNames?: string[] | null;
  enabledExtensionCount?: number;
  ppEnabledExtensionNames?: string[] | null;
}

declare var VkInstanceCreateInfo: {
  prototype: VkInstanceCreateInfo;
  new(param?: VkInstanceCreateInfoInitializer | null): VkInstanceCreateInfo;
  sType: number;
  pNext: null;
  flags: number;
  pApplicationInfo: VkApplicationInfo | null;
  enabledLayerCount: number;
  ppEnabledLayerNames: string[] | null;
  enabledExtensionCount: number;
  ppEnabledExtensionNames: string[] | null;
}

export interface VkInstanceCreateInfo {
  sType: number;
  pNext: null;
  flags: number;
  pApplicationInfo: VkApplicationInfo | null;
  enabledLayerCount: number;
  ppEnabledLayerNames: string[] | null;
  enabledExtensionCount: number;
  ppEnabledExtensionNames: string[] | null;
}
