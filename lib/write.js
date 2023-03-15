import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { outputFolder, overwriteFiles } from '../config.js'

const datePrefix = new Date().toISOString().split('T')[0]
const backupDir = overwriteFiles
  ? join(process.cwd(), outputFolder)
  : join(process.cwd(), outputFolder, datePrefix)

let backupDirExists = false
export const write = async (filename, data) => {
  console.log(`writing: ${filename}`)

  if (!backupDirExists) {
    await mkdir(backupDir, { recursive: true })
    backupDirExists = true
  }

  const file = join(backupDir, filename)
  await writeFile(file, JSON.stringify(data, null, 2))
}
