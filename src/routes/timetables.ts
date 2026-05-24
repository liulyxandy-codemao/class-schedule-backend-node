import Router from "@koa/router"
import { auth } from "../middleware/auth"
import { error, success } from "../types"
import * as db from "../db"

const router = new Router()

/** POST /timetables — 创建时间表 */
router.post("/timetables", auth, (ctx) => {
  const { name, content } = ctx.request.body as {
    name: string
    content: Record<string, unknown>[]
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

  const timetable = db.createTimetable(name, content)
  ctx.status = 201
  ctx.body = success(timetable)
})

/** GET /timetables/:timetableId — 获取时间表详情 */
router.get("/timetables/:timetableId", (ctx) => {
  const { timetableId } = ctx.params
  const row = db.getTimetableById(timetableId)
  if (!row) {
    ctx.status = 404
    ctx.body = error(
      40400,
      "时间表不存在",
      `timetable with id '${timetableId}' not found`
    )
    return
  }
  ctx.body = success({
    id: row.id,
    name: row.name,
    content: JSON.parse(row.content),
  })
})

/** PUT /timetables/:timetableId — 更新时间表 */
router.put("/timetables/:timetableId", auth, (ctx) => {
  const { timetableId } = ctx.params
  const existing = db.getTimetableById(timetableId)
  if (!existing) {
    ctx.status = 404
    ctx.body = error(
      40400,
      "时间表不存在",
      `timetable with id '${timetableId}' not found`
    )
    return
  }
  const { name, content } = ctx.request.body as {
    name: string
    content: Record<string, unknown>[]
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
  db.updateTimetable(timetableId, name, content)
  ctx.body = success({ id: timetableId, name, content })
})

/** DELETE /timetables/:timetableId — 删除时间表 */
router.delete("/timetables/:timetableId", auth, (ctx) => {
  const { timetableId } = ctx.params
  const existing = db.getTimetableById(timetableId)
  if (!existing) {
    ctx.status = 404
    ctx.body = error(
      40400,
      "时间表不存在",
      `timetable with id '${timetableId}' not found`
    )
    return
  }
  db.deleteTimetable(timetableId)
  ctx.status = 204
})

export default router
