const request = require('supertest');
const assert = require('assert');
const app = require('../server');  // Import the app, not the server

// Function to test a route (updated to return the request)
function testRoute(path, expectedStatusCode, expectedText) {
  return request(app)
    .get(path)  // Send a GET request to the given route
    .expect(expectedStatusCode)  // Expect the status code
    .then((res) => {  // Handle the response
      if (expectedText) {
        assert.ok(res.text.includes(expectedText), `Expected response to contain: ${expectedText}`);
      }
      console.log(`${path} passed`);
    })
    .catch((err) => {
      console.error(`Problem with request for ${path}: ${err.message}`);
    });
}

// Run tests after ensuring the server is up
setTimeout(() => {
  // Now we can use async/await or chaining with .then()
  testRoute('/db/getCharacters/680100f55adf9af0182d59a2', 200)  // Test /db/getCharacters route
    .then(() => {
      return testRoute('/calculator/logCurrenciesSummary', 200);  // Test /calculator route
    })
    .then(() => {
      return testRoute('/invalidroute', 404);  // Test for an invalid route
    })
    .catch(err => {
      console.error('Error during tests:', err);
    });
}, 2000);  // Give server some time to start
