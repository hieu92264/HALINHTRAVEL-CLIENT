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
}
