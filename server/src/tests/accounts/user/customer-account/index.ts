import 'express-async-errors';
import chai from 'chai';
import chaiHttp from 'chai-http';
import {
	testCreateCustomer,
	testGetCustomer,
	testDeleteCustomer,
	testGetNonExistentCustomer,
} from 'tests/helpers/user/customer';
import db from 'db';
import { newUsers, userDataTesting } from 'tests/authentication/user-data';
import registration from 'tests/helpers/auth/registration';
import { deleteUser, getDeletedUser } from 'tests/helpers/user';
chai.use(chaiHttp).should();

export default function testCustomerAccount() {
	beforeEach(async () => {
		// deletes all entries from user_account
		await db.query('delete from user_account');
	});

	describe('/POST customer account', async () => {
		// create new customer account
		it(`it should create new user account then a new customer account`, async () =>
			registration()
				.then((tokens) => testCreateCustomer(tokens))
				.catch((err) => {
					throw err;
				}));
	});

	describe('/GET customer account', () => {
		it(`it should create a new user account, create a customer account and retrieve the customer account`, async () =>
			registration()
				.then((tokens) => testCreateCustomer(tokens))
				.then(({ authTokens }) => testGetCustomer(authTokens))
				.catch((err) => {
					throw err;
				}));
	});

	describe('/DELETE customer account', () => {
		it('it should create and delete the customer account', async () =>
			registration()
				.then((tokens) => testCreateCustomer(tokens))
				.then(({ authTokens }) => testDeleteCustomer(authTokens))
				.catch((err) => {
					throw err;
				}));
	});

	describe('/GET nonexistent customer account', () => {
		it(`it should fail to retrieve the customer account`, async () =>
			registration().then((tokens) =>
				testGetNonExistentCustomer(tokens)
			));
	});
}
