import * as core from '@actions/core'
import { loadConfig } from './config.js'
import { createWriter } from './lib/write.js'
import { createGrafana } from './lib/grafana.js'
import { runBackup } from './lib/backup.js'

async function run() {
  try {
    const config = loadConfig()
    core.setSecret(config.grafanaToken)

    const writer = createWriter(config)
    const result = await runBackup({
      grafana: createGrafana(config),
      writer,
      options: {
        filenameFormat: config.filenameFormat,
        folderStructure: config.folderStructure
      }
    })

    core.info(
      `Backed up ${result.dashboards} dashboards and ${result.folders} folders to ${writer.backupDir}`
    )
    core.setOutput('backup_path', writer.backupDir)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
