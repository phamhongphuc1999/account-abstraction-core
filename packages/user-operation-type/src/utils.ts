import { PlainObject, RuntimeObject } from './query.js';

export const hasProperty = (object: RuntimeObject, name: string | number | symbol): boolean =>
  Object.hasOwnProperty.call(object, name);

export function isPlainObject(value: unknown): value is PlainObject {
  if (typeof value !== 'object' || value === null) return false;
  try {
    let proto = value;
    while (Object.getPrototypeOf(proto) !== null) {
      proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(value) === proto;
  } catch (_) {
    return false;
  }
}

export function normalizeUrlFromParsed(parsedUrl: URL): string {
  let result = '';
  result += parsedUrl.protocol;
  result += `//${parsedUrl.hostname}`;
  if (parsedUrl.port) result += `:${parsedUrl.port}`;
  result += `${parsedUrl.pathname}`;
  result += `${parsedUrl.search}`;
  return result;
}

export function isAddress(address: string) {
  if (address.substring(0, 2) !== '0x') address = '0x' + address;
  return address.match(/^0x[0-9,a-f,A-F]{40}$/);
}

export function getAddress(address: string) {
  if (isAddress(address)) {
    if (address.substring(0, 2) !== '0x') return '0x' + address;
    return address;
  }
  return null;
}
