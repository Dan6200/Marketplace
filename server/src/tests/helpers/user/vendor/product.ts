import application from 'application';
import testProcessRoute from 'tests/helpers/test-process-route';
import { StatusCodes } from 'http-status-codes';
import {
	productData,
	updateProductData,
} from 'tests/accounts/user/vendor-account/product/data';

const { CREATED, OK, NOT_FOUND } = StatusCodes;

let outputData: any = {},
	checkId = (data: any) => {
		data.should.have.property('product_id');
		data.product_id.should.be.a('string');
	};

const testCreateProduct = testProcessRoute({
	server: application,
	verb: 'post',
	url: '/api/v1/user/vendor/shop/products',
	statusCode: CREATED,
	data: productData,
	checks: checkId,
	outputData,
});

const productIds: string[] = [];
productIds.push(outputData.product_id);

const testGetAllProduct = testProcessRoute({
	server: application,
	verb: 'get',
	url: `/api/v1/user/vendor/shop/products`,
	statusCode: OK,
});

const testGetProduct = testProcessRoute({
	server: application,
	verb: 'get',
	// TODO: this is wrong, returns an array of urls
	url: `${productIds.map(
		(productId) => '/api/v1/user/vendor/shop/products/' + { productId }
	)}`,
	statusCode: OK,
});

const testUpdateProduct = testProcessRoute({
	server: application,
	verb: 'put',
	url: `/api/v1/user/vendor/shop/products/${productId}`,
	statusCode: OK,
	data: updateProductData,
});

const testDeleteProduct = testProcessRoute({
	server: application,
	verb: 'delete',
	url: `/api/v1/user/vendor/shop/products/${productId}`,
	statusCode: OK,
});

const testGetDeletedProduct = testProcessRoute({
	server: application,
	verb: 'get',
	url: `/api/v1/user/vendor/shop/products/${productId}`,
	statusCode: NOT_FOUND,
});

export {
	testCreateProduct,
	testGetAllProduct,
	testGetProduct,
	testUpdateProduct,
	testDeleteProduct,
	testGetDeletedProduct,
};
