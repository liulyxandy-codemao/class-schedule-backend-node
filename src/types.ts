export interface ClassInfo {
  id: string
  name: string
  description: string
}

export interface ClassListData {
  total: number
  page: number
  size: number
  items: ClassInfo[]
}

/** string[][] — 7天 × N节，[0]=周一 */
export type ScheduleData = string[][]

export interface ScheduleInfo {
  id: string
  name: string
  content: ScheduleData
}

export type TimeTableItemType = "course" | "caption"

export interface TimeTableItem {
  name: string
  type: TimeTableItemType
  bindId?: number | null
}

export type TimeTableData = TimeTableItem[]

export interface TimeTableInfo {
  id: string
  name: string
  content: TimeTableData
}

export interface VersionInfo {
  version: string
  versionCode: number
  updatelog: string
}

export interface CreateClassRequest {
  id: string
  name: string
  description?: string
}

export interface UpdateClassRequest {
  name?: string
  description?: string
}

export interface CreateScheduleRequest {
  name: string
  content: ScheduleData
}

export interface AssignScheduleRequest {
  scheduleId?: string
  content?: ScheduleData
}

export interface CreateTimeTableRequest {
  name: string
  content: TimeTableData
}

export interface AssignTimeTableRequest {
  timetableId?: string
  content?: TimeTableData
}

// ═══ 统一响应包裹 ═══

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  detail: string
}

export function success<T>(data: T): ApiResponse<T> {
  return { code: 0, message: "success", data, detail: "" }
}

export function error(code: number, message: string, detail = ""): ApiResponse<null> {
  return { code, message, data: null, detail }
}
