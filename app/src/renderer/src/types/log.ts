export type Log = {
  id: string
  createdAt: Date
  content: LogContent[]
  project?: {
    id: string
    name: string
  }
}

export type LogContent = {
  id: string
  createdAt: Date
  content: string
  logId: string
}

export type LogsResult = Record<string, Log[]>
