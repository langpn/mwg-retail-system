import { afterEach, expect, it, vi } from 'vitest'
import { api, ApiError } from './api'

afterEach(() => vi.unstubAllGlobals())

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
