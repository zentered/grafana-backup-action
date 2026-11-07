'use strict'

import { planFiles } from './names.js'

export const runBackup = async ({ grafana, writer, options = {} }) => {
  const dashboards = await grafana.fetchDashboards()
  const folders = await grafana.fetchFolders()

  await writer.write('folders.json', folders)
  await writer.write('dashboards.json', dashboards)

  for (const { dashboard, path } of planFiles(dashboards, options)) {
    const db = await grafana.fetchDashboard(dashboard.uid)
    await writer.write(path, db)
  }

  return { dashboards: dashboards.length, folders: folders.length }
}
