import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createGrafana } from '../lib/grafana.js'
import { mockFetch } from './helpers.js'

const hits = (from, count) =>
  Array.from({ length: count }, (_, i) => ({ uid: `u${from + i}` }))

const client = (fetch, pageSize = 3) =>
  createGrafana({
    grafanaUrl: 'https://g.example',
    grafanaToken: 'tok',
    fetch,
    pageSize
  })

test('fetchDashboards walks pages until a short page', async () => {
  const fetch = mockFetch((url) => {
    const page = Number(new URL(url).searchParams.get('page'))
    return { body: page === 1 ? hits(0, 3) : page === 2 ? hits(3, 3) : hits(6, 1) }
  })
  const all = await client(fetch).fetchDashboards()
  assert.equal(all.length, 7)
  assert.equal(fetch.calls.length, 3)
  const u = new URL(fetch.calls[0].url)
  assert.equal(u.pathname, '/api/search')
  assert.equal(u.searchParams.get('type'), 'dash-db')
  assert.equal(u.searchParams.get('limit'), '3')
})

test('an exact multiple of the page size costs one extra empty request', async () => {
  const fetch = mockFetch((url) => ({
    body: new URL(url).searchParams.get('page') === '1' ? hits(0, 3) : []
  }))
  const all = await client(fetch).fetchDashboards()
  assert.equal(all.length, 3)
  assert.equal(fetch.calls.length, 2)
})

test('fetchFolders paginates with type=dash-folder', async () => {
  const fetch = mockFetch((url) => ({
    body: new URL(url).searchParams.get('page') === '1' ? hits(0, 3) : hits(3, 1)
  }))
  const all = await client(fetch).fetchFolders()
  assert.equal(all.length, 4)
  assert.equal(new URL(fetch.calls[0].url).searchParams.get('type'), 'dash-folder')
})

test('the default page size is the API maximum of 5000', async () => {
  const fetch = mockFetch(() => ({ body: [] }))
  await createGrafana({
    grafanaUrl: 'https://g.example',
    grafanaToken: 't',
    fetch
  }).fetchDashboards()
  assert.equal(new URL(fetch.calls[0].url).searchParams.get('limit'), '5000')
})
