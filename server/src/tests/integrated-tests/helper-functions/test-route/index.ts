import chai from 'chai'
import BadRequestError from '../../../../errors/bad-request.js'
import { TestCreateRequestParamsGeneral } from '../../../../types-and-interfaces/test-routes.js'
import { UserRequestData } from '../../../../types-and-interfaces/user.js'
import { createUserWithEmailAndPasswordWrapper } from './create-user.js'

export default function ({
  verb,
  statusCode,
  validateResData,
  validateReqData,
}: TestCreateRequestParamsGeneral) {
  return async function <T>({
    server,
    token,
    path,
    query,
    body,
  }: {
    server: string
    token: string
    path: string
    query?: { [k: string]: any }
    body?: T
  }) {
    // Validate the request body
    if (body && !validateReqData)
      throw new BadRequestError('Must validate request data')
    if (validateReqData && !validateReqData(body))
      throw new BadRequestError('Invalid Request Data')

    if (verb === 'post' && path === '/v1/user') {
      const { email, password } = <UserRequestData>body
      token = await createUserWithEmailAndPasswordWrapper(email, password)
    }

    // Make request
    const request = chai
      .request(server)
      [verb](path)
      .query(query ?? {})
      .send(<object>body)

    // Add request token
    if (token) request.auth(token, { type: 'bearer' })
    const response = await request
    response.should.have.status(statusCode)

    // Validate the response body
    if (response.body && validateResData && !validateResData(response.body))
      throw new BadRequestError('Invalid Database Result')
    console.log(response.body)
    return response.body
  }
}
