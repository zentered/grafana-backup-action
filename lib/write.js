'use strict'

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve, sep } from 'node:path'

export const createWriter = ({
  outputFolder,
  overwriteFiles,
  cwd = process.cwd(),
  now = new Date()
}) => {
  const datePrefix = now.toISOString().split('T')[0]
  const backupDir = resolve(
    overwriteFiles
      ? join(cwd, outputFolder)
      : join(cwd, outputFolder, datePrefix)
  )

  const write = async (filename, data) => {
    const file = resolve(backupDir, filename)
    if (!file.startsWith(backupDir + sep)) {
      throw new Error(`Refusing to write outside the backup folder: ${filename}`)
    }
    console.log(`writing: ${filename}`)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, JSON.stringify(data, null, 2))
  }

  return { backupDir, write }
}
