import Koa from "koa"
import { koaBody } from "koa-body"
import { initDb } from "./db"
import { wrapResponse } from "./middleware/response"
import { CONFIG } from "./config"

import versionRouter from "./routes/version"
import classRouter from "./routes/class"
import classesRouter from "./routes/classes"
import schedulesRouter from "./routes/schedules"
import timetablesRouter from "./routes/timetables"

const app = new Koa()

// body 解析
app.use(koaBody())

// 统一响应包裹
app.use(wrapResponse)

// 路由
app.use(versionRouter.routes())
app.use(versionRouter.allowedMethods())
app.use(classRouter.routes())
app.use(classRouter.allowedMethods())
app.use(classesRouter.routes())
app.use(classesRouter.allowedMethods())
app.use(schedulesRouter.routes())
app.use(schedulesRouter.allowedMethods())
app.use(timetablesRouter.routes())
app.use(timetablesRouter.allowedMethods())

// fallback — 重定向到前端
app.use((ctx) => {
  ctx.redirect("https://cs.liulyxandy.cn")
})

async function main() {
  await initDb()
  console.log(`Database ready`)

  app.listen(CONFIG.PORT, () => {
    console.log(`Server running on http://localhost:${CONFIG.PORT}`)
  })
}

main().catch((err) => {
  console.error("Failed to start:", err)
  process.exit(1)
})
