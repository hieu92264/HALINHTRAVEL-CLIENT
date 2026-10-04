export declare global {
  type ApiDebugTrace = {
    file?: string
    line?: number
    class?: string
    type?: string
    function?: string
  }

  type ApiDebug = {
    exception: string
    message: string
    file: string
    line: number
    trace: ApiDebugTrace[]
  }

  type ResponseBody<T = unknown> = {
    message: string
    status_code: number
    metadata: T
    path: string
    timestamp: string
    debug?: ApiDebug
  }

  interface BaseEntity {
    id: number
    is_active?: boolean
    created_at?: string | null
    updated_at?: string | null
    user_name_created?: string | null
    user_name_updated?: string | null
  }
}
