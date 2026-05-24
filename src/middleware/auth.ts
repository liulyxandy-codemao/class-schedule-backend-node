import type { Middleware } from "koa"
import { CONFIG } from "../config"
import { error } from "../types"

/** Bearer Token 鉴权中间件 */
export const auth: Middleware = (ctx, next) => {
  const authHeader = ctx.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    ctx.status = 401
    ctx.body = error(40100, "未授权", "missing or invalid Authorization header")
    return
  }

  const token = authHeader.slice(7)
  if (token !== CONFIG.AUTH_TOKEN) {
    ctx.status = 401
    ctx.body = error(40100, "未授权", "invalid token")
    return
  }

  return next()
}
