import { test } from 'node:test'
import assert from 'node:assert/strict'
import { planFiles, slugify } from '../lib/names.js'

const d = (uid, title, extra = {}) => ({
  uid,
  title,
  uri: `db/${slugify(title)}`,
  ...extra
})
const paths = (dashboards, options) =>
  planFiles(dashboards, options).map((p) => p.path)

test('slugify handles case, accents, symbols and empty titles', () => {
  assert.equal(slugify('My Dash / Ünïcode!'), 'my-dash-unicode')
  assert.equal(slugify('###', 'dashboard'), 'dashboard')
  assert.equal(slugify(undefined), 'untitled')
})

test('legacy format keeps the file name derived from uri', () => {
  assert.deepEqual(paths([d('a', 'Node Exporter')]), ['node-exporter.json'])
})

test('legacy format falls back to the title when uri is missing', () => {
  assert.deepEqual(paths([{ uid: 'a', title: 'Node Exporter' }]), [
    'node-exporter.json'
  ])
})

test('dashboards with the same title all get their uid appended', () => {
  assert.deepEqual(paths([d('a1', 'CPU'), d('b2', 'CPU'), d('c3', 'Memory')]), [
    'cpu-a1.json',
    'cpu-b2.json',
    'memory.json'
  ])
})

test('names that differ only by case collide', () => {
  const out = paths([
    { uid: 'a1', uri: 'db/CPU' },
    { uid: 'b2', uri: 'db/cpu' }
  ])
  assert.deepEqual(out, ['CPU-a1.json', 'cpu-b2.json'])
})

test('a dashboard named like a file the backup writes does not overwrite it', () => {
  assert.deepEqual(paths([d('a1', 'Dashboards'), d('b2', 'Folders')]), [
    'dashboards-a1.json',
    'folders-b2.json'
  ])
})

test('uid format writes <title-slug>-<uid>.json', () => {
  assert.deepEqual(paths([d('a1', 'CPU'), d('b2', 'CPU')], { filenameFormat: 'uid' }), [
    'cpu-a1.json',
    'cpu-b2.json'
  ])
})

test('a hostile uri cannot escape the folder', () => {
  const [p] = paths([{ uid: 'a', uri: 'db/../../etc/passwd' }])
  assert.ok(!p.includes('/') && !p.startsWith('.'), p)
})

test('without folder_structure all files stay in one folder', () => {
  const out = paths([
    d('a1', 'CPU', { folderUid: 'f1', folderTitle: 'Ops' }),
    d('b2', 'CPU', { folderUid: 'f2', folderTitle: 'Dev' })
  ])
  assert.deepEqual(out, ['cpu-a1.json', 'cpu-b2.json'])
})

test('folder_structure writes dashboards into folder sub-folders', () => {
  const out = paths(
    [
      d('a1', 'CPU', { folderUid: 'f1', folderTitle: 'Ops Team' }),
      d('b2', 'CPU', { folderUid: 'f2', folderTitle: 'Dev' }),
      d('c3', 'Home')
    ],
    { folderStructure: true }
  )
  // Same title in different folders no longer collides.
  assert.deepEqual(out, ['ops-team/cpu.json', 'dev/cpu.json', 'home.json'])
})

test('folder_structure disambiguates folders with the same title', () => {
  const out = paths(
    [
      d('a1', 'CPU', { folderUid: 'f1', folderTitle: 'Ops' }),
      d('b2', 'CPU', { folderUid: 'f2', folderTitle: 'Ops' })
    ],
    { folderStructure: true }
  )
  assert.deepEqual(out, ['ops-f1/cpu.json', 'ops-f2/cpu.json'])
})
