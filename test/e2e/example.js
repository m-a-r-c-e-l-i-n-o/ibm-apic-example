'use strict';
var path = require('path');
var _ = require('lodash');
var expect = require('chai').expect;
var db = require('../../db/memdb.json');
var decode = require('decode-html');
var browser = global.browser;
var apiURL = global.TEST_API_URL;

// convert db items into js objects
db.models.item = _.mapValues(db.models.item, function(item) {
  return JSON.parse(item);
});

describe('Inventory Items API', function() {
  it('returns all items in db', function() {
    var itemsURL = path.join(apiURL, 'items');
    var response = decode(browser.url(itemsURL).getHTML('pre', false));
    var items = JSON.parse(response);
    expect(_.keyBy(items, 'id')).to.deep.equal(db.models.item);
  });
});
