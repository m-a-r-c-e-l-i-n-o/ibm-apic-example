'use strict';

var Promise = global.Promise;
var execSync = require('child_process').execSync;
var fs = require('fs');
var path = require('path');
var fetch = require('node-fetch');
var retry = require('retry');
var config = require('./config.json');
var YAML = require('yamljs');

// kick things off
Promise.resolve()
  .then(publishTestServer)
  // .then(publishTestAPIs)
  // .then(runTests)
  // .then(stageProductionProducts)
  // .then(publishProductionServer)
  // .then(publishProductionAPIs)
  .catch(function(err) {
    console.error(err.stack || err);
  });

function publishServer(appName, orgName, target) {
  var publish = 'npm run-script apic -- apps:publish ';
  var options = '';
  options += ' --app ' + appName;
  options += ' --organization ' + orgName;
  options += ' --server us.apiconnect.ibmcloud.com';

  console.log('Publishing App:', publish + options);
  execSync(publish + options);

  return faultTolerantResolve(target)
    .then(function(response) {
      console.log('Success: ', response);
    })
    .catch(function(err) {
      console.error('All attempts failed: ', err);
      throw new Error('There is no hope for this (' + target + ') server.');
    });
};

function publishTestServer() {
  var testing = config.testing;
  return publishServer(testing.app, testing.org, testing.target);
};

function publishProductionServer() {
  var production = config.production;
  return publishServer(production.app, production.org, production.target);
};

function publishProducts(orgName, catalogName, stage) {
  var publish = 'npm run-script apic -- publish ';
  var options = '';
  options += ' --catalog ' + catalogName;
  options += ' --organization ' + orgName;
  options += ' --server us.apiconnect.ibmcloud.com';

  if (stage) {
    options += ' --stage';
  }

  return getAllProducts()
    .then(function(products) {
      products.forEach(function(product) {
        console.log('Publishing Product:', publish + product + options);
        execSync(publish + product + options);
      });
    });
};

function publishTestProducts() {
  var testing = config.testing;
  publishProducts(testing.org, testing.catalog);
  return Promise.resolve();
};

function stageProductionProducts() {
  var production = config.production;
  publishProducts(production.org, production.catalog, true);
  return Promise.resolve();
};

function publishProductionProducts() {
  var production = config.production;
  publishProducts(production.org, production.catalog);
  return Promise.resolve();
};

getAllProducts()
  .then(function(products) {
    console.log('products', products);
  })
  .catch(function(err) {
    console.log(err);
  });

function getAllProducts() {
  return new Promise(function(resolve, reject) {
    var dirname = 'definitions';
    fs.readdir(dirname, function(err, filenames) {
      if (err) {
        reject(err);
      }
      var products = filenames
        .filter(function(filename) {
          return (/\.(yml|yaml)$/i).test(filename);
        })
        .map(function(filename) {
          var fullFilename = path.join(dirname, filename);
          return {
            filename: fullFilename,
            content: YAML.load(fullFilename),
          };
        })
        .filter(function(yaml) {
          return yaml.content && yaml.content.product;
        })
        .map(function(yaml) {
          return yaml.filename;
        });
      resolve(products);
    });
  });
};

function faultTolerantResolve(address, cb) {
  var operation = retry.operation();
  console.log('Awaiting server restart...');
  return new Promise(function(resolve, reject) {
    operation.attempt(function(currentAttempt) {
      fetch(address)
        .then(function(response) {
          resolve(response);
        })
        .catch(function(err) {
          console.log('Attempt #', currentAttempt, ':', err.message);
          if (operation.retry(err)) {
            return;
          }
          reject(operation.mainError());
        });
    });
  });
};
