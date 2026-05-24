import Router from "@koa/router"
import { auth } from "../middleware/auth"
import { error, success } from "../types"
import * as db from "../db"

const router = new Router()

/** GET /classes — 获取班级列表 */
router.get("/classes", (ctx) => {
  const page = Math.max(1, +(ctx.query.page as string) || 1)
  const size = Math.min(100, Math.max(1, +(ctx.query.size as string) || 20))
  const keyword = ctx.query.keyword as string | undefined

  const { total, items } = db.listClasses(page, size, keyword)
  ctx.body = success({ total, page, size, items })
})

/** POST /classes — 创建班级 */
router.post("/classes", auth, (ctx) => {
  const { id, name, description } = ctx.request.body as {
    id: string
    name: string
    description?: string
  }

  if (!id || !name) {
    ctx.status = 400
    ctx.body = error(
      40001,
      "请求参数校验失败",
      '"id" and "name" are required'
    )
    return
  }

  if (!/^[a-zA-Z0-9_]+$/.test(id)) {
    ctx.status = 400
    ctx.body = error(
      40001,
      "请求参数校验失败",
      '"id" must match ^[a-zA-Z0-9_]+$'
    )
    return
  }

  if (id.length > 64) {
    ctx.status = 400
    ctx.body = error(
      40001,
      "请求参数校验失败",
      '"id" must be at most 64 characters'
    )
    return
  }

  const existing = db.getClassById(id)
  if (existing) {
    ctx.status = 409
    ctx.body = error(
      40900,
      "资源冲突",
      `class with id '${id}' already exists`
    )
    return
  }

  db.createClass(id, name, description)
  ctx.status = 201
  ctx.body = success(db.getClassById(id))
})

export default router
