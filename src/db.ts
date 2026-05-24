import initSqlJs, { Database as SqlJsDatabase, QueryExecResult, SqlValue } from "sql.js"
import { readFileSync, writeFileSync, existsSync, copyFileSync } from "node:fs"
import { CONFIG } from "./config"

let db: SqlJsDatabase

function rowToObject<T>(
  columns: string[],
  values: SqlValue[]
): T {
  const obj: Record<string, unknown> = {}
  columns.forEach((col, i) => {
    obj[col] = values[i]
  })
  return obj as T
}

/** 将 QueryExecResult 转为对象数组 */
function asObjects<T>(
  results: QueryExecResult[]
): T[] {
  if (results.length === 0) return []
  const { columns, values } = results[0]
  return values.map((row) => rowToObject<T>(columns, row))
}

/** 执行查询并返回第一行 */
function getOne<T>(
  sql: string,
  params: SqlValue[]
): T | undefined {
  const results = db.exec(sql, params)
  if (results.length === 0 || results[0].values.length === 0) return undefined
  return rowToObject<T>(results[0].columns, results[0].values[0])
}

/** 执行查询并返回多行 */
function getAll<T>(
  sql: string,
  params: SqlValue[]
): T[] {
  const results = db.exec(sql, params)
  return asObjects<T>(results)
}

/** 执行写操作 */
function run(sql: string, params: SqlValue[] = []) {
  db.run(sql, params)
}

/** 持久化到磁盘 */
function save() {
  writeFileSync(CONFIG.DB_PATH, db.export())
}

// ═══ 初始化 ═══

export async function initDb(): Promise<void> {
  const SQL = await initSqlJs()

  if (existsSync(CONFIG.DB_PATH)) {
    const buffer = readFileSync(CONFIG.DB_PATH)
    db = new SQL.Database(buffer)
    return
  }

  // 尝试从 Bun 版迁移数据
  const bunDbPath = "../class-schedule-backend/index.db"
  if (existsSync(bunDbPath)) {
    copyFileSync(bunDbPath, CONFIG.DB_PATH)
    const buffer = readFileSync(CONFIG.DB_PATH)
    db = new SQL.Database(buffer)
    return
  }

  db = new SQL.Database()
}

// ═══ 班级 ═══

export function getClassById(id: string) {
  return getOne<{ id: string; name: string; description: string }>(
    "SELECT id, name, description FROM class WHERE id = ?",
    [id]
  )
}

export interface ClassRow {
  id: string
  name: string
  description: string
  using_schedule: string
  using_timetable: string
}

export function getClassRow(id: string) {
  return getOne<ClassRow>("SELECT * FROM class WHERE id = ?", [id])
}

export function listClasses(page: number, size: number, keyword?: string) {
  if (keyword) {
    const totalResult = getOne<{ cnt: number }>(
      "SELECT COUNT(*) as cnt FROM class WHERE name LIKE ?",
      [`%${keyword}%`]
    )
    const total = totalResult?.cnt ?? 0
    const items = getAll<{ id: string; name: string; description: string }>(
      "SELECT id, name, description FROM class WHERE name LIKE ? LIMIT ? OFFSET ?",
      [`%${keyword}%`, size, (page - 1) * size]
    )
    return { total, items }
  }

  const totalResult = getOne<{ cnt: number }>(
    "SELECT COUNT(*) as cnt FROM class",
    []
  )
  const total = totalResult?.cnt ?? 0
  const items = getAll<{ id: string; name: string; description: string }>(
    "SELECT id, name, description FROM class LIMIT ? OFFSET ?",
    [size, (page - 1) * size]
  )
  return { total, items }
}

export function createClass(id: string, name: string, description?: string) {
  run("INSERT INTO class (id, name, description) VALUES (?, ?, ?)", [
    id,
    name,
    description ?? "",
  ])
  save()
}

export function updateClass(id: string, name?: string, description?: string) {
  const sets: string[] = []
  const params: string[] = []
  if (name !== undefined) {
    sets.push("name = ?")
    params.push(name)
  }
  if (description !== undefined) {
    sets.push("description = ?")
    params.push(description)
  }
  if (sets.length === 0) return
  params.push(id)
  run(`UPDATE class SET ${sets.join(", ")} WHERE id = ?`, params)
  save()
}

export function deleteClass(id: string) {
  run("DELETE FROM class WHERE id = ?", [id])
  save()
}

// ═══ 课表 ═══

export function getClassSchedule(classId: string) {
  const cls = getClassRow(classId)
  if (!cls?.using_schedule) return null
  const row = getOne<{ content: string }>(
    "SELECT content FROM schedule WHERE id = ?",
    [cls.using_schedule]
  )
  return row ? (JSON.parse(row.content) as string[][]) : null
}

export function getScheduleById(id: string) {
  return getOne<{ id: string; name: string; content: string }>(
    "SELECT * FROM schedule WHERE id = ?",
    [id]
  )
}

export function createSchedule(name: string, content: string[][]) {
  const id = "sch_" + crypto.randomUUID().slice(0, 8)
  run("INSERT INTO schedule (id, name, content) VALUES (?, ?, ?)", [
    id,
    name,
    JSON.stringify(content),
  ])
  save()
  return { id, name, content }
}

export function updateSchedule(id: string, name: string, content: string[][]) {
  run("UPDATE schedule SET name = ?, content = ? WHERE id = ?", [
    name,
    JSON.stringify(content),
    id,
  ])
  save()
}

export function deleteSchedule(id: string) {
  run("DELETE FROM schedule WHERE id = ?", [id])
  save()
}

export function assignScheduleToClass(
  classId: string,
  scheduleId?: string,
  content?: string[][]
): void {
  if (scheduleId) {
    run("UPDATE class SET using_schedule = ? WHERE id = ?", [scheduleId, classId])
  } else if (content) {
    const { id } = createSchedule("", content)
    run("UPDATE class SET using_schedule = ? WHERE id = ?", [id, classId])
  }
  save()
}

// ═══ 时间表 ═══

export function getClassTimetable(classId: string) {
  const cls = getClassRow(classId)
  if (!cls?.using_timetable) return null
  const row = getOne<{ content: string }>(
    "SELECT content FROM timetable WHERE id = ?",
    [cls.using_timetable]
  )
  return row ? (JSON.parse(row.content) as unknown) : null
}

export function getTimetableById(id: string) {
  return getOne<{ id: string; name: string; content: string }>(
    "SELECT * FROM timetable WHERE id = ?",
    [id]
  )
}

export function createTimetable(
  name: string,
  content: Record<string, unknown>[]
) {
  const id = "tt_" + crypto.randomUUID().slice(0, 8)
  run("INSERT INTO timetable (id, name, content) VALUES (?, ?, ?)", [
    id,
    name,
    JSON.stringify(content),
  ])
  save()
  return { id, name, content }
}

export function updateTimetable(
  id: string,
  name: string,
  content: Record<string, unknown>[]
) {
  run("UPDATE timetable SET name = ?, content = ? WHERE id = ?", [
    name,
    JSON.stringify(content),
    id,
  ])
  save()
}

export function deleteTimetable(id: string) {
  run("DELETE FROM timetable WHERE id = ?", [id])
  save()
}

export function assignTimetableToClass(
  classId: string,
  timetableId?: string,
  content?: Record<string, unknown>[]
): void {
  if (timetableId) {
    run("UPDATE class SET using_timetable = ? WHERE id = ?", [
      timetableId,
      classId,
    ])
  } else if (content) {
    const { id } = createTimetable("", content)
    run("UPDATE class SET using_timetable = ? WHERE id = ?", [id, classId])
  }
  save()
}
