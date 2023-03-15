import { grafanaOrg, grafanaApiKey } from '../config.js'
import fetch from 'node-fetch'

const fetchGrafana = async (query) => {
  const res = await fetch(`https://${grafanaOrg}.grafana.net/api/${query}`, {
    headers: {
      Authorization: `Bearer ${grafanaApiKey}`
    }
  })
  return res.json()
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
