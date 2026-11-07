import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createGrafana } from '../lib/grafana.js'
import { mockFetch } from './helpers.js'

const TOKEN = 'glsa_supersecret'
const make = (fetch, sleeps = []) =>
  createGrafana({
    grafanaUrl: 'https://g.example',
    grafanaToken: TOKEN,
    fetch,
    sleep: async (ms) => sleeps.push(ms)
  })

test('sends the token as a bearer header', async () => {
  const fetch = mockFetch(() => ({ body: { ok: true } }))
  await make(fetch).fetchDashboard('abc')
  assert.equal(fetch.calls[0].init.headers.Authorization, `Bearer ${TOKEN}`)
  assert.equal(fetch.calls[0].url, 'https://g.example/api/dashboards/uid/abc')
})

test('a 401 is not retried and names status, endpoint and body', async () => {
  const fetch = mockFetch(() => ({
    status: 401,
    statusText: 'Unauthorized',
    body: '{"message":"invalid API key"}'
  }))
  const sleeps = []
  await assert.rejects(make(fetch, sleeps).fetchDashboard('abc'), (err) => {
    assert.match(err.message, /401 Unauthorized/)
    assert.match(err.message, /dashboards\/uid\/abc/)
    assert.match(err.message, /invalid API key/)
    assert.ok(!err.message.includes(TOKEN))
    return true
  })
  assert.equal(fetch.calls.length, 1)
  assert.deepEqual(sleeps, [])
})

test('retries 429 and honors Retry-After', async () => {
  const fetch = mockFetch((_url, n) =>
    n < 3 ? { status: 429, headers: { 'retry-after': '2' } } : { body: { ok: 1 } }
  )
  const sleeps = []
  const res = await make(fetch, sleeps).fetchDashboard('abc')
  assert.deepEqual(res, { ok: 1 })
  assert.equal(fetch.calls.length, 3)
  assert.deepEqual(sleeps, [2000, 2000])
})

test('retries 5xx with exponential backoff, then gives up with the status', async () => {
  const fetch = mockFetch(() => ({ status: 503, statusText: 'Service Unavailable' }))
  const sleeps = []
  await assert.rejects(make(fetch, sleeps).fetchDashboard('abc'), /503 Service Unavailable/)
  assert.equal(fetch.calls.length, 4)
  assert.deepEqual(sleeps, [500, 1000, 2000])
})

test('a network error keeps the cause and never prints the token', async () => {
  const cause = Object.assign(new Error('connect failed'), { code: 'ECONNREFUSED' })
  const fetch = async () => {
    throw new TypeError('fetch failed', { cause })
  }
  await assert.rejects(make(fetch).fetchDashboard('abc'), (err) => {
    assert.match(err.message, /ECONNREFUSED/)
    assert.equal(err.cause.cause, cause)
    assert.ok(!err.message.includes(TOKEN))
    return true
  })
})
