export type JsonValue = string | number | boolean | null | JsonObject | JsonArray
export type JsonObject = { [key: string]: JsonValue }
export type JsonArray = JsonValue[]

export interface Props {
  data: JsonValue
  indent?: number
  isRoot?: boolean
}
