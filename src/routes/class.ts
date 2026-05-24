import Router from "@koa/router"
import { auth } from "../middleware/auth"
import { error, success } from "../types"
import * as db from "../db"

const router = new Router()

/** GET /class/:id — 获取班级信息 */
router.get("/class/:id", (ctx) => {
  const { id } = ctx.params
  const cls = db.getClassById(id)
  if (!cls) {
    ctx.status = 404
    ctx.body = error(40400, "班级不存在", `class with id '${id}' not found`)
    return
  }
  ctx.body = success(cls)
})

/** PATCH /class/:id — 更新班级 */
router.patch("/class/:id", auth, (ctx) => {
  const { id } = ctx.params
  const existing = db.getClassById(id)
  if (!existing) {
    ctx.status = 404
    ctx.body = error(40400, "班级不存在", `class with id '${id}' not found`)
    return
  }
  const { name, description } = ctx.request.body as {
    name?: string
    description?: string
  }
  db.updateClass(id, name, description)
  ctx.body = success(db.getClassById(id))
})

/** DELETE /class/:id — 删除班级 */
router.delete("/class/:id", auth, (ctx) => {
  const { id } = ctx.params
  const existing = db.getClassById(id)
  if (!existing) {
    ctx.status = 404
    ctx.body = error(40400, "班级不存在", `class with id '${id}' not found`)
    return
  }
  db.deleteClass(id)
  ctx.status = 204
})

/** GET /class/:id/schedule — 获取班级课表数据 */
router.get("/class/:id/schedule", (ctx) => {
  const { id } = ctx.params
  const schedule = db.getClassSchedule(id)
  if (!schedule) {
    ctx.status = 404
    ctx.body = error(
      40400,
      "课表不存在",
      `schedule for class '${id}' not found`
    )
    return
  }
  ctx.body = success(schedule)
})

/** PUT /class/:id/schedule — 为班级分配课表 */
router.put("/class/:id/schedule", auth, (ctx) => {
  const { id } = ctx.params
  const existing = db.getClassById(id)
  if (!existing) {
    ctx.status = 404
    ctx.body = error(40400, "班级不存在", `class with id '${id}' not found`)
    return
  }
  const { scheduleId, content } = ctx.request.body as {
    scheduleId?: string
    content?: string[][]
  }
  if (!scheduleId && !content) {
    ctx.status = 400
    ctx.body = error(
      40001,
      "请求参数校验失败",
      "either scheduleId or content is required"
    )
    return
  }
  db.assignScheduleToClass(id, scheduleId!, content!)
  ctx.body = success(null)
})

/** GET /class/:id/timetable — 获取班级时间表 */
router.get("/class/:id/timetable", (ctx) => {
  const { id } = ctx.params
  const timetable = db.getClassTimetable(id)
  if (!timetable) {
    ctx.status = 404
    ctx.body = error(
      40400,
      "时间表不存在",
      `timetable for class '${id}' not found`
    )
    return
  }
  ctx.body = success(timetable)
})

/** PUT /class/:id/timetable — 为班级分配时间表 */
router.put("/class/:id/timetable", auth, (ctx) => {
  const { id } = ctx.params
  const existing = db.getClassById(id)
  if (!existing) {
    ctx.status = 404
    ctx.body = error(40400, "班级不存在", `class with id '${id}' not found`)
    return
  }
  const { timetableId, content } = ctx.request.body as {
    timetableId?: string
    content?: Record<string, unknown>[]
  }
  if (!timetableId && !content) {
    ctx.status = 400
    ctx.body = error(
      40001,
      "请求参数校验失败",
      "either timetableId or content is required"
    )
    return
  }
  db.assignTimetableToClass(id, timetableId!, content!)
  ctx.body = success(null)
})

// 尾部斜杠兼容
router.get("/class/:id/", (ctx) => {
  const { id } = ctx.params
  const cls = db.getClassById(id)
  if (!cls) {
    ctx.status = 404
    ctx.body = error(40400, "班级不存在", `class with id '${id}' not found`)
    return
  }
  ctx.body = success(cls)
})

export default router
