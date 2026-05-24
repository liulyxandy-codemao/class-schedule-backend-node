export const CONFIG = {
  PORT: 8910,
  DB_PATH: "index.db",
  // TODO: 从环境变量读取，默认值仅用于开发
  AUTH_TOKEN: process.env.AUTH_TOKEN || "changeme",
} as const
