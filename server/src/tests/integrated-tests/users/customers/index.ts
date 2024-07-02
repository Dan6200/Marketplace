import { testPostCustomer, testDeleteCustomer } from './utils/index.js'
import { UserRequestData } from '../../../../types-and-interfaces/users/index.js'
import { knex } from '../../../../db/index.js'
import {
  testHasCustomerAccount,
  testHasNoCustomerAccount,
} from '../../users/utils/index.js'

// Set server url
const server = process.env.SERVER!
let token: string

export default function ({ userInfo }: { userInfo: UserRequestData }) {
  describe('Customer account management', () => {
    before(async () => {
      // Delete all user accounts
      await knex('users')
        .del()
        .where('email', userInfo.email)
        .orWhere('phone', userInfo.phone)
    })

    const path = '/v1/users/customers'

    it('it should create a customer user for the user', () =>
      testPostCustomer({ server, token, path }))

    it("it should show that the customer account has been created in the user's is_customer field", async () =>
      testHasCustomerAccount({
        server,
        token,
        path: path.slice(0, path.lastIndexOf('customers')),
      }))

    it("it should delete the user's customer account", () =>
      testDeleteCustomer({ server, token, path }))

    it("it should show that the customer account does not exist in the user's is_customer field", async () =>
      testHasNoCustomerAccount({
        server,
        token,
        path: path.slice(0, path.lastIndexOf('customers')),
      }))
  })
}
