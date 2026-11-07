'use strict'

export const FILENAME_FORMATS = ['legacy', 'uid']

// Files the backup writes next to the dashboards.
const RESERVED = new Set(['folders', 'dashboards'])

export const slugify = (value, fallback = 'untitled') => {
  const slug = String(value ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || fallback
}

// Keep a server-provided string safe as one path segment.
const safeSegment = (value) =>
  String(value)
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^[.-]+/, '')
    .replace(/-+$/, '')

const baseName = (d, filenameFormat) => {
  if (filenameFormat === 'uid') {
    return `${slugify(d.title, 'dashboard')}-${safeSegment(d.uid)}`
  }
  // The search field `uri` ("db/<slug>") is deprecated, but it is what earlier
  // versions used. Keep it so existing backups do not get renamed.
  const fromUri =
    typeof d.uri === 'string' ? safeSegment(d.uri.replace(/^db\//, '')) : ''
  return fromUri || slugify(d.title, 'dashboard')
}

const folderDirs = (dashboards) => {
  const byUid = new Map()
  for (const d of dashboards) {
    if (d.folderUid) byUid.set(d.folderUid, slugify(d.folderTitle, 'folder'))
  }
  const counts = new Map()
  for (const slug of byUid.values()) {
    const key = slug.toLowerCase()
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const dirs = new Map()
  for (const [uid, slug] of byUid) {
    dirs.set(
      uid,
      counts.get(slug.toLowerCase()) > 1 ? `${slug}-${safeSegment(uid)}` : slug
    )
  }
  return dirs
}

/**
 * Map each dashboard to a unique relative file path.
 *
 * Dashboards whose names collide (same title in two folders, a title equal to
 * a file the backup writes itself, names that differ only by case) all get
 * their uid appended. No collision, no change: names stay stable between runs.
 */
export const planFiles = (
  dashboards,
  { filenameFormat = 'legacy', folderStructure = false } = {}
) => {
  const dirs = folderStructure ? folderDirs(dashboards) : new Map()
  const entries = dashboards.map((dashboard) => ({
    dashboard,
    dir: dirs.get(dashboard.folderUid) ?? '',
    base: baseName(dashboard, filenameFormat)
  }))

  const key = ({ dir, base }) => `${dir}/${base}`.toLowerCase()
  const counts = new Map()
  for (const e of entries) counts.set(key(e), (counts.get(key(e)) ?? 0) + 1)

  const used = new Set()
  return entries.map((e) => {
    const reserved = e.dir === '' && RESERVED.has(e.base.toLowerCase())
    let base =
      counts.get(key(e)) > 1 || reserved
        ? `${e.base}-${safeSegment(e.dashboard.uid)}`
        : e.base
    // Last resort when even the uid-suffixed name is taken.
    for (let n = 2; used.has(`${e.dir}/${base}`.toLowerCase()); n++) {
      base = `${e.base}-${safeSegment(e.dashboard.uid)}-${n}`
    }
    used.add(`${e.dir}/${base}`.toLowerCase())
    return {
      dashboard: e.dashboard,
      path: e.dir ? `${e.dir}/${base}.json` : `${base}.json`
    }
  })
}
