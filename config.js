import * as core from '@actions/core'

import { FILENAME_FORMATS } from './lib/names.js'

const DEFAULT_OUTPUT_FOLDER = 'backup'

const firstSet = (...values) => values.find((v) => v !== undefined && v !== '')

/**
 * Resolve settings. A step input wins; the legacy env var is the fallback so
 * workflows written for v1.1.1 keep working.
 */
export function loadConfig({ getInput = core.getInput, env = process.env } = {}) {
  const grafanaOrg = firstSet(getInput('grafana_org'), env.GRAFANA_ORG)
  const grafanaToken = firstSet(
    getInput('grafana_token'),
    env.GRAFANA_CLOUD_API_KEY
  )
  const configuredUrl = firstSet(getInput('grafana_url'), env.GRAFANA_URL)
  const grafanaUrl = (
    configuredUrl ?? (grafanaOrg ? `https://${grafanaOrg}.grafana.net` : undefined)
  )?.replace(/\/+$/, '')

  // An unset env var falls back to "backup"; an empty one keeps the repo root,
  // as in v1.1.1.
  const outputFolder = firstSet(getInput('output_folder')) ??
    env.OUTPUT_FOLDER ?? DEFAULT_OUTPUT_FOLDER
  const overwriteFiles =
    (firstSet(getInput('overwrite_files'), env.OVERWRITE_FILES) ?? '')
      .toString()
      .toLowerCase() === 'true'

  const filenameFormat =
    firstSet(getInput('filename_format'), env.FILENAME_FORMAT) ?? 'legacy'
  if (!FILENAME_FORMATS.includes(filenameFormat)) {
    throw new Error(
      `Invalid filename_format "${filenameFormat}": use ${FILENAME_FORMATS.join(' or ')}`
    )
  }
  const folderStructure =
    (firstSet(getInput('folder_structure'), env.FOLDER_STRUCTURE) ?? '')
      .toString()
      .toLowerCase() === 'true'

  if (!grafanaToken) {
    throw new Error(
      'Missing Grafana token: set the grafana_token input or GRAFANA_CLOUD_API_KEY'
    )
  }
  if (!grafanaUrl) {
    throw new Error(
      'Missing Grafana URL: set grafana_url or grafana_org (or GRAFANA_ORG)'
    )
  }

  return {
    grafanaUrl,
    grafanaOrg,
    grafanaToken,
    outputFolder,
    overwriteFiles,
    filenameFormat,
    folderStructure
  }
}
