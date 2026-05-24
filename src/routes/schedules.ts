import Router from "@koa/router"
import { auth } from "../middleware/auth"
import { error, success } from "../types"
import * as db from "../db"

const router = new Router()

/** POST /schedules — 创建课表 */
router.post("/schedules", auth, (ctx) => {
  const { name, content } = ctx.request.body as {
    name: string
    content: string[][]
  }

  if (!name || !content) {
    ctx.status = 400
    ctx.body = error(
      40001,
      "请求参数校验失败",
      '"name" and "content" are required'
    )
    return
  }

  const schedule = db.createSchedule(name, content)
  ctx.status = 201
  ctx.body = success(schedule)
})

/** GET /schedules/:scheduleId — 获取课表详情 */
router.get("/schedules/:scheduleId", (ctx) => {
  const { scheduleId } = ctx.params
  const row = db.getScheduleById(scheduleId)
  if (!row) {
    ctx.status = 404
    ctx.body = error(
      40400,
      "课表不存在",
      `schedule with id '${scheduleId}' not found`
    )
    return
  }
  ctx.body = success({
    id: row.id,
    name: row.name,
    content: JSON.parse(row.content),
  })
})

/** PUT /schedules/:scheduleId — 更新课表 */
router.put("/schedules/:scheduleId", auth, (ctx) => {
  const { scheduleId } = ctx.params
  const existing = db.getScheduleById(scheduleId)
  if (!existing) {
    ctx.status = 404
    ctx.body = error(
      40400,
      "课表不存在",
      `schedule with id '${scheduleId}' not found`
    )
    return
  }
  const { name, content } = ctx.request.body as {
    name: string
    content: string[][]
  }
  if (!name || !content) {
    ctx.status = 400
    ctx.body = error(
      40001,
      "请求参数校验失败",
      '"name" and "content" are required'
    )
    return
  }
  db.updateSchedule(scheduleId, name, content)
  ctx.body = success({ id: scheduleId, name, content })
})

/** DELETE /schedules/:scheduleId — 删除课表 */
router.delete("/schedules/:scheduleId", auth, (ctx) => {
  const { scheduleId } = ctx.params
  const existing = db.getScheduleById(scheduleId)
  if (!existing) {
    ctx.status = 404
    ctx.body = error(
      40400,
      "课表不存在",
      `schedule with id '${scheduleId}' not found`
    )
    return
  }
  db.deleteSchedule(scheduleId)
  ctx.status = 204
})

export default router
