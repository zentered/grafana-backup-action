import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadConfig } from '../config.js'

const load = ({ inputs = {}, env = {} } = {}) =>
  loadConfig({ getInput: (name) => inputs[name] ?? '', env })

const base = { grafana_token: 'tok', grafana_org: 'acme' }

test('inputs build the default grafana.net url', () => {
  const c = load({ inputs: base })
  assert.equal(c.grafanaUrl, 'https://acme.grafana.net')
  assert.equal(c.grafanaToken, 'tok')
})

test('grafana_url wins over the org default and loses its trailing slash', () => {
  const c = load({
    inputs: { ...base, grafana_url: 'https://grafana.example.com/' }
  })
  assert.equal(c.grafanaUrl, 'https://grafana.example.com')
})

test('legacy env vars still work', () => {
  const c = load({
    env: { GRAFANA_CLOUD_API_KEY: 'old', GRAFANA_ORG: 'legacy' }
  })
  assert.equal(c.grafanaToken, 'old')
  assert.equal(c.grafanaUrl, 'https://legacy.grafana.net')
})

test('inputs win over env vars', () => {
  const c = load({
    inputs: { grafana_token: 'new', grafana_org: 'new-org' },
    env: { GRAFANA_CLOUD_API_KEY: 'old', GRAFANA_ORG: 'legacy' }
  })
  assert.equal(c.grafanaToken, 'new')
  assert.equal(c.grafanaUrl, 'https://new-org.grafana.net')
})

test('outputFolder defaults to backup when nothing is set', () => {
  assert.equal(load({ inputs: base }).outputFolder, 'backup')
})

test('outputFolder keeps an empty OUTPUT_FOLDER env var', () => {
  assert.equal(
    load({ inputs: base, env: { OUTPUT_FOLDER: '' } }).outputFolder,
    ''
  )
})

test('output_folder input wins over OUTPUT_FOLDER', () => {
  const c = load({
    inputs: { ...base, output_folder: 'in' },
    env: { OUTPUT_FOLDER: 'env' }
  })
  assert.equal(c.outputFolder, 'in')
})

test('overwriteFiles is true only for "true"', () => {
  assert.equal(
    load({ inputs: { ...base, overwrite_files: 'true' } }).overwriteFiles,
    true
  )
  assert.equal(
    load({ inputs: base, env: { OVERWRITE_FILES: 'true' } }).overwriteFiles,
    true
  )
  assert.equal(
    load({ inputs: { ...base, overwrite_files: '1' } }).overwriteFiles,
    false
  )
  assert.equal(load({ inputs: base }).overwriteFiles, false)
})

test('missing token throws', () => {
  assert.throws(() => load({ inputs: { grafana_org: 'acme' } }), /token/)
})

test('missing url and org throws', () => {
  assert.throws(() => load({ inputs: { grafana_token: 'tok' } }), /URL/)
})
