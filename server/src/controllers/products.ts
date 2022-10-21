import db from 'db';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError } from 'errors/';
import 'helper-functions';
import processRoute from './helpers/processRoute';
import { ProductSchemaReq } from 'app-schema/product';
const fileName = require('path').basename(__filename);

let insertProductTable = `insert into product values (title, category, description, list_price, net_price, vendor_id)`;

let dbQueries = [
	async ({ userId }) => {
		await db.query(insertProductTable, [userId]);
	},
];

let validateBody = (data: object): object => {
	const validData = ProductSchemaReq.validate(data);
	if (validData.error)
		throw new BadRequestError(
			'Invalid Data Schema: ' + validData.error.message
		);
	return validData.value;
};

let createProduct = processRoute(dbQueries, validateBody);
/*
let createProduct = async (request, response) => {
	let { userId }: UserPayload = request.user;
	await db.query(
,
		[userId]
	);
	response.status(StatusCodes.CREATED).json({
		newProductId: userId,
	});
};
*/

let getProduct = async (request, response) => {
	let result = (
		await db.query(
			`select * from product
		where product_id=$1`,
			[userId]
		)
	).rows[0];
	if (!result)
		response.status(StatusCodes.NOT_FOUND).send('product  cannot be found');
	response.status(StatusCodes.OK).json({
		productId: userId,
	});
};

let updateProduct = async (request, response) => {};

let deleteProduct = async (request, response) => {
	await db.query(
		`delete from product
		where product_id=$1`,
		[userId]
	);
	response.status(StatusCodes.OK).end();
};

export { createProduct, getProduct, updateProduct, deleteProduct };
