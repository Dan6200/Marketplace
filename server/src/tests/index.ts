import Authentication from 'authentication';
import testUserAccount from 'accounts/user';
import testShippingInfo from 'accounts/user/customer-account/shipping-info';
import testShop from './accounts/user/vendor-account/shop';

describe('Authentication Routes', Authentication);
describe('User Account Routes', testUserAccount);
describe('Customer Shipping Routes', testShippingInfo);
describe('Vendor Shop Routes', testShop);
