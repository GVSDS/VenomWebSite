/** Venom 官网 API 客户端
 *
 * 同源调用 `/API/Venom/*`（venom.gvsds.com 的 /API/ 前缀由主服务接管）：
 * 包数据存在提供者子服务器，主服务按域名反查产品后回源读取。
 */

export interface VenomDependency {
  Name: string
  Version: string
}

export interface VenomRelease {
  ReleaseUUID: string
  Version: string
  Notes: string
  PublisherName: string
  CreateTime: string
}

export interface VenomProject {
  PackageUUID: string
  PackageName: string
  PackageDesc: string
  CreatorName: string
  CreateTime: string
  UpdateTime: string
  ReleaseCount: number
  Readme: string
  Dependencies: VenomDependency[]
  LatestVersion: string
  Releases: VenomRelease[]
}

/** API 错误（带 HTTP 状态码，供页面区分「不存在」与「服务异常」） */
export class VenomApiError extends Error {
  readonly Status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'VenomApiError'
    this.Status = status
  }
}

/** 逐段编码包名（保留 `/`，兼容 @scope/name 这类作用域包名） */
function encodeName(name: string): string {
  return name
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/')
}

/** 取包详情（含 README / 依赖列表 / 发布历史） */
export async function getProject(name: string): Promise<VenomProject> {
  const resp = await fetch(`/API/Venom/Project/${encodeName(name)}`, {
    headers: { Accept: 'application/json' },
  })
  let payload: { code?: number; msg?: string; data?: VenomProject } | null = null
  try {
    payload = await resp.json()
  } catch {
    throw new VenomApiError(`服务响应异常（HTTP ${resp.status}）`, resp.status)
  }
  if (!resp.ok || payload?.code !== 0 || !payload.data) {
    throw new VenomApiError(payload?.msg || `请求失败（HTTP ${resp.status}）`, resp.status)
  }
  return payload.data
}
