import type { Middleware } from "koa"
import type { ApiResponse } from "../types"

/** 将成功响应的 body 自动包裹进统一格式 */
export const wrapResponse: Middleware = async (ctx, next) => {
  await next()

  // 只包裹成功的 JSON 响应
  if (
    ctx.body != null &&
    ctx.body !== undefined &&
    ctx.type === "application/json" &&
    (ctx.status === 200 || ctx.status === 201)
  ) {
    const body = ctx.body as ApiResponse
    // 如果已经是包裹格式（有 code 字段），就不再包裹
    if (typeof body === "object" && "code" in body) return

    // 包裹
    ctx.body = {
      code: 0,
      message: "success",
      data: ctx.body,
      detail: "",
    }
  }
}
