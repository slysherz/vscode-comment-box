// @ts-check
"use strict"

const path = require('path')
const Mocha = require('mocha')
const fs = require('fs')

/**
 * Runs the extension tests
 * @returns {Promise<void>}
 */
function run() {
    // Create the mocha test
    const mocha = new Mocha({
        ui: 'tdd',
        color: true,
        timeout: 10000
    })

    const testsRoot = path.resolve(__dirname, '..')

    return new Promise((resolve, reject) => {
        // Find all test files
        const testFiles = fs.readdirSync(testsRoot)
            .filter(file => file.endsWith('.test.js'))

        // Add files to the test suite
        testFiles.forEach(file => {
            mocha.addFile(path.resolve(testsRoot, file))
        })

        try {
            // Run the mocha test
            mocha.run(failures => {
                if (failures > 0) {
                    reject(new Error(`${failures} tests failed.`))
                } else {
                    resolve()
                }
            })
        } catch (err) {
            console.error(err)
            reject(err)
        }
    })
}

module.exports = { run }
