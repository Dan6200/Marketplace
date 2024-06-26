import { StatusCodes } from 'http-status-codes'
import {
  ProcessRouteWithoutBody,
  QueryParams,
} from '../../../types-and-interfaces/process-routes.js'
import createRouteProcessor from '../../routes/process.js'
import { knex } from '../../../db/index.js'
import { QueryResult, QueryResultRow } from 'pg'
import { isSuccessful } from '../../helpers/query-validation.js'

const { CREATED, NO_CONTENT } = StatusCodes

/**
 * @description Add a customer account to the database
 **/
const createQuery = async <T>({
  userId: customerId,
}: QueryParams<T>): Promise<QueryResult<QueryResultRow>> =>
  knex('customers').insert({ customer_id: customerId }).returning('customer_id')

/**
 * @description Delete the customer account from the database
 **/
const deleteQuery = async <T>({
  userId: customerId,
}: QueryParams<T>): Promise<QueryResult<QueryResultRow>> =>
  knex('customers')
    .where('customer_id', customerId)
    .del()
    .returning('customer_id')

const processPostRoute = <ProcessRouteWithoutBody>createRouteProcessor
const processDeleteRoute = <ProcessRouteWithoutBody>createRouteProcessor

const createCustomerAccount = processPostRoute({
  Query: createQuery,
  status: CREATED,
  validateResult: isSuccessful,
})

const deleteCustomerAccount = processDeleteRoute({
  Query: deleteQuery,
  status: NO_CONTENT,
  validateResult: isSuccessful,
})

export { createCustomerAccount, deleteCustomerAccount }
