import { Response } from 'express'
import { RequestWithPayload } from '../../types-and-interfaces/request.js'
import {
  isTypeQueryResultRow,
  Status,
} from '../../types-and-interfaces/response.js'
import {
  QueryDB,
  QueryParams,
} from '../../types-and-interfaces/process-routes.js'
import BadRequestError from '../../errors/bad-request.js'
import { QueryResult, QueryResultRow } from 'pg'

export default ({
  Query,
  QueryForwarder,
  status,
  validateBody,
  validateResult,
}: {
  Query: QueryDB
  QueryForwarder?: (s: string) => QueryDB
  status: Status
  validateBody?: <T>(body: T) => boolean
  validateResult?: (
    result: any[] | QueryResult<QueryResultRow | QueryResultRow[]>
  ) => boolean
}) => {
  // return the route processor middleware
  return async (request: RequestWithPayload, response: Response) => {
    const { params, query, body } = request
    let uid: string | undefined
    if (request.uid != null) ({ uid } = request)

    // Validate request data
    if (
      typeof body != 'undefined' &&
      Object.values(body).length !== 0 &&
      validateBody
    ) {
      // validateBody throws error if body is invalid
      validateBody(body)
    }

    let dbResponse: unknown
    if (QueryForwarder) {
      // Call the correct query handler based on route is public or not
      const publicQuery = <string>query!.public
      dbResponse = await QueryForwarder(publicQuery)({
        uid,
        body,
        params,
        query,
      })
    } else {
      // remove password
      const { password, ...bodyWoPassword } = body
      dbResponse = await Query({ uid, body: bodyWoPassword, params, query })
    }
    console.log('db response', dbResponse)
    if (!isTypeQueryResultRow(dbResponse) && !Array.isArray(dbResponse))
      throw new BadRequestError(`The Database operation could not be completed`)

    if (validateResult) {
      // validateBody throws error if data is invalid
      // check for errors
      validateResult(dbResponse)
      let responseData: any = null
      if (isTypeQueryResultRow(dbResponse)) {
        if (dbResponse.rowCount === 1) responseData = dbResponse.rows[0]
        else responseData = dbResponse.rows
      }
      if (Array.isArray(dbResponse)) {
        if (dbResponse.length === 1) responseData = dbResponse[0]
        else responseData = dbResponse
      }
      return response.status(status).json(responseData)
    }
    response.status(status).end()
  }
}
