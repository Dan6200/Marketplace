import { Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { QueryResult, QueryResultRow } from 'pg'
import { ParsedQs } from 'qs'
import { RequestWithPayload } from './request.js'
const { CREATED, OK, NO_CONTENT, NOT_FOUND } = StatusCodes

export type Status =
  | typeof CREATED
  | typeof OK
  | typeof NO_CONTENT
  | typeof NOT_FOUND

export type QueryParams<T> = {
  userId?: string
  body?: { [key: string]: T }
  params?: { [key: string]: string }
  query?: ParsedQs
}

export type QueryDB = <T>(
  queryParams: QueryParams<T>
) => Promise<QueryResult<QueryResultRow | QueryResultRow[]>>

export type ProcessRouteWithoutBody = <T>({
  Query,
  status,
  validateResult,
}: {
  Query<T>(
    queryParams: QueryParams<T>
  ): Promise<QueryResult<QueryResultRow | QueryResultRow[]>>
  status: Status
  validateResult: (
    result: QueryResult<QueryResultRow | QueryResultRow[]>
  ) => Promise<void>
}) => (
  request: RequestWithPayload,
  response: Response
) => Promise<Response<T, Record<string, T>>>

export type ProcessRouteWithNoDBResult = <T>({
  Query,
  status,
  validateBody,
}: {
  Query: (queryData: {
    userId?: string
    body?: Record<string, T>
    params?: Record<string, string>
    query?: ParsedQs
  }) => Promise<Record<string, T>>
  status: Status
  validateBody?: <T>(qp: QueryParams<T>) => Promise<void>
}) => (
  request: RequestWithPayload,
  response: Response
) => Promise<Response<T, Record<string, T>>>

export type ProcessRouteWithoutBodyAndDBResult = <T>({
  Query,
  status,
}: {
  Query: QueryDB
  status: Status
}) => (
  request: RequestWithPayload,
  response: Response
) => Promise<Response<T, Record<string, T>>>

export type ProcessRoute = <T>({
  Query,
  status,
  validateBody,
  validateResult,
}: {
  Query<T>(
    queryParams: QueryParams<T>
  ): Promise<QueryResult<QueryResultRow | QueryResultRow[]>>
  status: Status
  validateBody?: <T>(qp: QueryParams<T>) => Promise<void>
  validateResult: (
    result: QueryResult<QueryResultRow | QueryResultRow[]>
  ) => Promise<void>
}) => (
  request: RequestWithPayload,
  response: Response
) => Promise<Response<T, Record<string, T>>>

export type ProcessRouteWithForwarder = <T>({
  QueryForwarder,
  status,
  validateBody,
  validateResult,
}: {
  QueryForwarder: (s: string) => QueryDB
  status: Status
  validateBody?: <T>(qp: QueryParams<T>) => Promise<void>
  validateResult?: (
    result: QueryResult<QueryResultRow | QueryResultRow[]>
  ) => Promise<void>
}) => (
  request: RequestWithPayload,
  response: Response
) => Promise<Response<T, Record<string, T>>>
