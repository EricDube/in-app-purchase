var assert = require('assert');
var fs = require('fs');
var fixedPath = process.cwd() + '/test/receipts/amazon';
var fixedKeyPath = process.cwd() + '/test/receipts/amazon.secret';

describe('iap', function () {
	
	var sharedKey = process.argv[process.argv.length - 2].replace('--sharedKey=', '');
	var path = process.argv[process.argv.length - 1].replace('--path=', '');
	var iap = require('../');

	if (sharedKey === 'false') {
		sharedKey = fixedKeyPath;
	}
	if (path === 'false') {
		path = fixedPath;
	}

	it('Can NOT validate amazon in-app-purchase with incorrect receipt', function (done) {
		var fakeReceipt = { userId: null, receiptId: 'fake-receipt' };
		iap.config({
			secret: sharedKey
		});
		iap.setup(function (error) {
			iap.validate(iap.AMAZON, fakeReceipt, function (error, response) {
				console.log(error, response);
				assert(error);
				assert.equal(iap.isValidated(response), false);
				done();
			});
		});
	});

	it('Can validate amazon in-app-purchase', function (done) {
		fs.readFile(path, 'UTF-8', function (error, data) {
			assert.equal(error, null);
			iap.config({
				secret: sharedKey
			});
			iap.setup(function (error) {
				assert.equal(error, null);
				var receipt = JSON.parse(data.toString());
				iap.validate(iap.AMAZON, receipt, function (error, response) {
					console.log(error, response);
					assert.equal(error, null);
					assert.equal(iap.isValidated(response), true);
					var pdata = iap.getPurchaseData(response);
					for (var i = 0, len = pdata.length; i < len; i++) {
						assert(pdata[i].productId);
						assert(pdata[i].purchaseDate);
						assert(pdata[i].quantity);
					}
					console.log(pdata);
					done();
				});
			});
		});
	});

	it('Can get an error response', function (done) {
		var fakeReceipt = { userId: null, receiptId: 'fake-receipt' };
		iap.config({
			secret: sharedKey
		});
		iap.setup(function (error) {
			iap.validate(iap.AMAZON, fakeReceipt, function (error, response) {
				assert(error);
				assert(response);
				assert(response.status);
				assert(response.message);
				assert.equal(iap.isValidated(response), false);
				console.log(response);
				done();
			});
		});
	});

});
