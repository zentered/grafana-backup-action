import { write } from './lib/write.js'
import { fetchDashboards, fetchDashboard, fetchFolders } from './lib/grafana.js'
import fetch from 'node-fetch'

const writeFiles = []
const dashboards = await fetchDashboards()
const folders = await fetchFolders()

writeFiles.push(write('folders.json', folders))
writeFiles.push(write('dashboards.json', dashboards))

for (const d of dashboards) {
  const db = await fetchDashboard(d.uid)
  writeFiles.push(write(`${d.uri.replace('db/', '')}.json`, db))
}

await Promise.all(writeFiles)
