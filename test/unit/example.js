'use strict';
var path = require('path');
var YAML = require('yamljs');
var expect = require('chai').expect;
var inventory = YAML.load('./definitions/inventory-product.yaml');

describe('Inventory Gold Plan', function() {
  var goldPlan = inventory.plans['Gold-Plan'];
  it('should allow for unlimited calls', function() {
    expect(goldPlan['rate-limit'].value).to.equal('unlimited');
  });
});
