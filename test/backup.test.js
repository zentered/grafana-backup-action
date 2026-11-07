import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readdir, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runBackup } from '../lib/backup.js'
import { createWriter } from '../lib/write.js'

const fakeGrafana = (dashboards, folders = []) => ({
  fetchDashboards: async () => dashboards,
  fetchFolders: async () => folders,
  fetchDashboard: async (uid) => ({ dashboard: { uid } })
})

const tree = async (dir, prefix = '') => {
  const out = []
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.isDirectory()) out.push(...(await tree(join(dir, e.name), `${prefix}${e.name}/`)))
    else out.push(`${prefix}${e.name}`)
  }
  return out.sort()
}

const now = new Date('2026-11-07T10:00:00Z')

test('overwrite_files=true writes straight into the output folder', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'gba-'))
  const writer = createWriter({ outputFolder: 'backup', overwriteFiles: true, cwd, now })
  await runBackup({ grafana: fakeGrafana([{ uid: 'a', uri: 'db/x' }]), writer })
  assert.equal(writer.backupDir, join(cwd, 'backup'))
  assert.deepEqual(await tree(join(cwd, 'backup')), ['dashboards.json', 'folders.json', 'x.json'])
})

test('overwrite_files=false writes into a date-stamped sub-folder', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'gba-'))
  const writer = createWriter({ outputFolder: 'backup', overwriteFiles: false, cwd, now })
  await runBackup({ grafana: fakeGrafana([{ uid: 'a', uri: 'db/x' }]), writer })
  assert.equal(writer.backupDir, join(cwd, 'backup', '2026-11-07'))
  assert.deepEqual(await tree(join(cwd, 'backup')), [
    '2026-11-07/dashboards.json',
    '2026-11-07/folders.json',
    '2026-11-07/x.json'
  ])
})

test('overwrite_files=true replaces a previous run', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'gba-'))
  for (const title of ['one', 'two']) {
    const writer = createWriter({ outputFolder: 'b', overwriteFiles: true, cwd, now })
    await runBackup({
      grafana: { ...fakeGrafana([{ uid: 'a', uri: 'db/x' }]), fetchDashboard: async () => ({ title }) },
      writer
    })
  }
  const data = JSON.parse(await readFile(join(cwd, 'b', 'x.json'), 'utf8'))
  assert.equal(data.title, 'two')
})

test('colliding dashboards both survive in the backup', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'gba-'))
  const writer = createWriter({ outputFolder: 'b', overwriteFiles: true, cwd, now })
  await runBackup({
    grafana: fakeGrafana([
      { uid: 'a1', uri: 'db/cpu' },
      { uid: 'b2', uri: 'db/cpu' }
    ]),
    writer
  })
  assert.deepEqual(await tree(join(cwd, 'b')), [
    'cpu-a1.json',
    'cpu-b2.json',
    'dashboards.json',
    'folders.json'
  ])
  assert.equal(JSON.parse(await readFile(join(cwd, 'b', 'cpu-b2.json'), 'utf8')).dashboard.uid, 'b2')
})

test('the writer refuses paths outside the backup folder', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'gba-'))
  const writer = createWriter({ outputFolder: 'b', overwriteFiles: true, cwd, now })
  await assert.rejects(writer.write('../escape.json', {}), /outside the backup folder/)
})
