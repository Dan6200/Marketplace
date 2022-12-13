import Authentication from 'authentication';
import testUserAccount from 'accounts/user';
import testCustomerAccount from './accounts/user/customer-account';
import testVendorAccount from './accounts/user/vendor-account';
import testShippingInfo from 'accounts/user/customer-account/shipping-info';
import testShop from './accounts/user/vendor-account/shop';
import testProduct from './accounts/user/vendor-account/product';

/*
 * TODO: fix bug with updateUserPassword controller
 * and this two ...
	describe('Customer Shipping Routes', testShippingInfo);
	describe('Vendor Shop Routes', testShop);
 */
//describe('Authentication Routes', Authentication);
describe('User Account Routes', testUserAccount);
//describe('Customer Account Routes', testCustomerAccount);
//describe('Vendor Account Routes', testVendorAccount);
//describe('Product Routes', testProduct);
