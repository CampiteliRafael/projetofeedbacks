import { beforeAll, afterEach, afterAll } from 'vitest';
import '@testing-library/jest-dom/vitest'; 
import { TextEncoder, TextDecoder } from 'util'; 
import { server } from './mocks/server'; 

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());