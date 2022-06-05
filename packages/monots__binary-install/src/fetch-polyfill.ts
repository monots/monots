import fetch, { Blob, File, FormData, Headers, Request, Response } from 'node-fetch';

if (!globalThis.fetch) {
  // @ts-expect-error - clash of types
  globalThis.fetch = fetch;
  // @ts-expect-error - clash of types
  globalThis.Headers = Headers;
  // @ts-expect-error - clash of types
  globalThis.Request = Request;
  // @ts-expect-error - clash of types
  globalThis.Response = Response;
  globalThis.FormData = FormData;
  globalThis.File = File;
  globalThis.Blob = Blob;
}
