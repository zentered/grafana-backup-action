'use strict'

export const MAX_PAGE_SIZE = 5000
const MAX_ATTEMPTS = 4
const BASE_DELAY_MS = 500
const MAX_DELAY_MS = 60_000

const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const isRetryable = (status) => status === 429 || status >= 500

// Retry-After is either delay-seconds or an HTTP date.
const retryDelay = (res, attempt) => {
  const header = res?.headers?.get?.('retry-after')
  if (header) {
    const seconds = Number(header)
    const ms = Number.isFinite(seconds)
      ? seconds * 1000
      : Date.parse(header) - Date.now()
    if (Number.isFinite(ms)) return Math.min(Math.max(ms, 0), MAX_DELAY_MS)
  }
  return Math.min(BASE_DELAY_MS * 2 ** attempt, MAX_DELAY_MS)
}

export const createGrafana = ({
  grafanaUrl,
  grafanaToken,
  fetch: fetchFn = globalThis.fetch,
  sleep = defaultSleep,
  pageSize = MAX_PAGE_SIZE
}) => {
  // The error message names the endpoint and status. It never contains the
  // token: the token only appears in the Authorization header.
  const fetchGrafana = async (path) => {
    const url = `${grafanaUrl}/api/${path}`
    for (let attempt = 0; ; attempt++) {
      let res
      try {
        res = await fetchFn(url, {
          headers: { Authorization: `Bearer ${grafanaToken}` }
        })
      } catch (err) {
        const detail = err.cause?.code ?? err.cause?.message ?? err.message
        throw new Error(`Grafana API error: GET /api/${path} failed (${detail})`, {
          cause: err
        })
      }

      if (res.ok) return res.json()

      if (isRetryable(res.status) && attempt < MAX_ATTEMPTS - 1) {
        const delay = retryDelay(res, attempt)
        console.error(
          `GET /api/${path} returned ${res.status}, retrying in ${delay} ms`
        )
        await sleep(delay)
        continue
      }

      const body = (await res.text().catch(() => '')).slice(0, 200)
      throw new Error(
        `Grafana API error: GET /api/${path} returned ${res.status} ${res.statusText}${body ? `: ${body}` : ''}`
      )
    }
  }

  // /api/search returns at most `limit` hits per page; `page` starts at 1.
  const fetchAll = async (type) => {
    const all = []
    for (let page = 1; ; page++) {
      const hits = await fetchGrafana(
        `search?type=${type}&limit=${pageSize}&page=${page}`
      )
      all.push(...hits)
      if (hits.length < pageSize) return all
    }
  }

  return {
    fetchFolders: () => fetchAll('dash-folder'),
    fetchDashboards: () => fetchAll('dash-db'),
    fetchDashboard: (uid) => fetchGrafana(`dashboards/uid/${encodeURIComponent(uid)}`)
  }
}
