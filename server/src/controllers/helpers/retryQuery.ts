import { error, log } from 'console'

enum networkErrors {
  'ENOENT',
  'ETIMEDOUT',
  'ECONNRESET',
  'ENOTFOUND',
  'ECONNREFUSED',
  'ECONNABORTED',
  'EAI_AGAIN',
}
let runOnce: boolean = true
export default async function retryQuery(
  query: (...rest: any[]) => Promise<any>,
  args: any[],
  retries: number,
  ms: number
): Promise<any> {
  let res: any
  try {
    if (!retries) {
      log(`db connection failed...quitting`)
      return
    }
    res = query(...args)
    return res
  } catch (err) {
    error(err)
    if (err.code in networkErrors)
      return new Promise((resolve) => {
        setTimeout(resolve, ms)
      }).then(() => {
        if (retries > 1) {
          if (runOnce) runOnce = false
          else ms <<= 1
          log(`db connection failed...retrying after ${ms}ms`)
          res = retryQuery(query, args, retries - 1, ms)
        }
        return res
      })
    throw err
  }
}
