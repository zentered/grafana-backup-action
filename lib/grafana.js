'use strict'

export const MAX_PAGE_SIZE = 5000

export const createGrafana = ({ grafanaUrl, grafanaToken, fetch: fetchFn = globalThis.fetch, pageSize = MAX_PAGE_SIZE }) => {
  const fetchGrafana = async (query) => {
    try {
      const res = await fetchFn(`${grafanaUrl}/api/${query}`, {
        headers: {
          Authorization: `Bearer ${grafanaToken}`
        }
      })

      if (!res || !res.ok) {
        console.error(`Error: ${res.status} ${res.statusText}`)
        throw new Error('Grafana API error')
      }

      return res.json()
    } catch (err) {
      console.error(err)
      throw new Error('Grafana API error', { cause: err })
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
    fetchDashboard: (uid) => fetchGrafana(`dashboards/uid/${uid}`)
  }
}
