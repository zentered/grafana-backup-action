'use strict'

import { grafanaOrg, grafanaApiKey } from '../config.js'

const fetchGrafana = async (query) => {
  try {
    const res = await fetch(`https://${grafanaOrg}.grafana.net/api/${query}`, {
      headers: {
        Authorization: `Bearer ${grafanaApiKey}`
      }
    })

    if (!res || !res.ok) {
      console.error(`Error: ${res.status} ${res.statusText}`)
      throw new Error('Grafana API error')
    }

    return res.json()
  } catch (err) {
    console.error(err)
    throw new Error('Grafana API error')
  }
}

export const fetchFolders = async () => {
  return fetchGrafana('search?type=dash-folder&limit=1000')
}

export const fetchDashboards = async () => {
  return fetchGrafana('search?type=dash-db&limit=1000')
}

export const fetchDashboard = async (uid) => {
  return fetchGrafana(`dashboards/uid/${uid}`)
}
