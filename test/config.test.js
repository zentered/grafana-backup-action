import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const configPath = fileURLToPath(new URL('../config.js', import.meta.url))

// config.js reads process.env at import time, so each case runs in a child.
const readConfig = (env) =>
  JSON.parse(
    execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `import * as c from ${JSON.stringify(configPath)}; console.log(JSON.stringify(c))`
      ],
      { env: { PATH: process.env.PATH, ...env }, encoding: 'utf8' }
    )
  )

test('outputFolder defaults to backup when OUTPUT_FOLDER is unset', () => {
  assert.equal(readConfig({}).outputFolder, 'backup')
})

test('outputFolder keeps an empty OUTPUT_FOLDER', () => {
  assert.equal(readConfig({ OUTPUT_FOLDER: '' }).outputFolder, '')
})

test('outputFolder uses OUTPUT_FOLDER when set', () => {
  assert.equal(readConfig({ OUTPUT_FOLDER: 'out' }).outputFolder, 'out')
})

test('overwriteFiles is true only for the string "true"', () => {
  assert.equal(readConfig({ OVERWRITE_FILES: 'true' }).overwriteFiles, true)
  assert.equal(readConfig({ OVERWRITE_FILES: '1' }).overwriteFiles, false)
  assert.equal(readConfig({}).overwriteFiles, false)
})
