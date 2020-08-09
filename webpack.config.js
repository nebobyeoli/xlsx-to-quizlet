const test_secret = process.env.test_secret;
const webpack = require('webpack');

module.exports = {
    entry: "./test-secret.js",
    resolve: {
        extensions: ['.js']
    },
}