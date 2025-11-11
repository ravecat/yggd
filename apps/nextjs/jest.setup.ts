import { TextEncoder, TextDecoder } from 'util';

// @ts-expect-error - polyfill for jose
global.TextEncoder = TextEncoder;
// @ts-expect-error - polyfill for jose
global.TextDecoder = TextDecoder;
