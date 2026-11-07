'use strict'

import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

export const createWriter = ({ outputFolder, overwriteFiles }) => {
  const datePrefix = new Date().toISOString().split('T')[0]
  const backupDir = resolve(
    overwriteFiles
      ? join(process.cwd(), outputFolder)
      : join(process.cwd(), outputFolder, datePrefix)
  )

  let ensureDir
  const write = async (filename, data) => {
    console.log(`writing: ${filename}`)

    ensureDir ??= mkdir(backupDir, { recursive: true })
    await ensureDir

    const file = join(backupDir, filename)
    await writeFile(file, JSON.stringify(data, null, 2))
  }

  return { backupDir, write }
}
