import * as core from '@actions/core'
import { loadConfig } from './config.js'
import { createWriter } from './lib/write.js'
import { createGrafana } from './lib/grafana.js'

async function run() {
  try {
    const config = loadConfig()
    core.setSecret(config.grafanaToken)

    const { fetchDashboards, fetchDashboard, fetchFolders } =
      createGrafana(config)
    const { write, backupDir } = createWriter(config)

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
    core.setOutput('backup_path', backupDir)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
