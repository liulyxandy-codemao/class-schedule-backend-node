import Router from "@koa/router"
import { readFileSync, existsSync } from "node:fs"
import { success, error } from "../types"

const router = new Router()

router.get("/version", (ctx) => {
  const configPath = "config.json"
  if (existsSync(configPath)) {
    const raw = readFileSync(configPath, "utf-8")
    ctx.body = success(JSON.parse(raw))
  } else {
    ctx.body = error(50000, "Could not read version", "Config file not found")
  }
})

export default router
