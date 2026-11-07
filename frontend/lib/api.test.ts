import { afterEach, expect, it, vi } from 'vitest'
import { api, ApiError } from './api'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.resetModules()
})

it('links to MVC on the backend host when the API uses a separate origin', async () => {
  vi.resetModules()
  vi.stubEnv('NEXT_PUBLIC_API_BASE', 'http://localhost:8088/api/v1')
  const { MVC_URL } = await import('./api')
  expect(MVC_URL).toBe('http://localhost:8088/mvc/catalog')
})

it('links to MVC on the current origin when the API uses a relative URL', async () => {
  vi.stubEnv('NEXT_PUBLIC_API_BASE', '/api/v1')
  const { MVC_URL } = await import('./api')
  expect(MVC_URL).toBe('/mvc/catalog')
})

it('does not classify a reachable server with an error response as offline', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('{"error":"unavailable"}', { status: 503 })))
  expect(await api.ping()).toBe(true)
})

it('does not classify a reachable server with malformed data as offline', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>not JSON</html>', { status: 200 })))
  expect(await api.ping()).toBe(true)
})

it('classifies a network failure as unreachable', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('network failure') }))
  expect(await api.ping()).toBe(false)
})

it('exposes the backend error and status', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('{"error":"Không đủ hàng"}', { status: 400 })))
  await expect(api.orders.list()).rejects.toMatchObject({ status: 400, message: 'Không đủ hàng' } satisfies Partial<ApiError>)
})
