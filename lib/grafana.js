'use strict'

export const createGrafana = ({ grafanaUrl, grafanaToken }) => {
  const fetchGrafana = async (query) => {
    try {
      const res = await fetch(`${grafanaUrl}/api/${query}`, {
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

  return {
    fetchFolders: () => fetchGrafana('search?type=dash-folder&limit=1000'),
    fetchDashboards: () => fetchGrafana('search?type=dash-db&limit=1000'),
    fetchDashboard: (uid) => fetchGrafana(`dashboards/uid/${uid}`)
  }
}
