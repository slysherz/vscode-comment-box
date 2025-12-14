// @ts-check
"use strict"

const assert = require('assert')
const vscode = require('vscode')
const {
    getDefaultStyleAndConfig,
    tryGetStyleAndConfig,
    getStyleList,
    CONFIGURATION_NAME,
} = require('../src/configuration')

// ============================================================================
// Configuration Test Helpers
// ============================================================================

/**
 * Storage for original global values to restore after tests
 * @type {Map<string, any>}
 */
const originalGlobalValues = new Map()

/**
 * Set a configuration value at the specified scope
 * @param {string} key - Configuration key (e.g., 'capitalize' or 'styles')
 * @param {any} value - Value to set (undefined to unset)
 * @param {vscode.ConfigurationTarget} target - Configuration target scope
 * @param {vscode.Uri} [resourceUri] - Resource URI for WorkspaceFolder scope
 * @returns {Promise<void>}
 */
async function setConfig(key, value, target, resourceUri) {
    const config = vscode.workspace.getConfiguration(CONFIGURATION_NAME, resourceUri)

    // Store original global value if not already stored
    if (target === vscode.ConfigurationTarget.Global && !originalGlobalValues.has(key)) {
        const inspected = config.inspect(key)
        originalGlobalValues.set(key, inspected?.globalValue)
    }

    await config.update(key, value, target)
}

/**
 * Reset a configuration value at the specified scope (sets to undefined)
 * @param {string} key - Configuration key
 * @param {vscode.ConfigurationTarget} target - Configuration target scope
 * @param {vscode.Uri} [resourceUri] - Resource URI for WorkspaceFolder scope
 * @returns {Promise<void>}
 */
async function resetConfig(key, target, resourceUri) {
    await setConfig(key, undefined, target, resourceUri)
}

/**
 * Restore all modified global values to their original state
 * Call this in afterEach() to clean up test modifications
 * @returns {Promise<void>}
 */
async function restoreGlobalConfig() {
    const config = vscode.workspace.getConfiguration(CONFIGURATION_NAME)

    for (const [key, originalValue] of originalGlobalValues) {
        // Handle language-specific keys
        if (key.startsWith('[')) {
            const match = key.match(/^\[(\w+)\]\.(.+)$/)
            if (match) {
                const [, languageId, configKey] = match
                const langConfig = vscode.workspace.getConfiguration(CONFIGURATION_NAME, { languageId })
                await langConfig.update(configKey, originalValue, vscode.ConfigurationTarget.Global)
            }
        } else {
            await config.update(key, originalValue, vscode.ConfigurationTarget.Global)
        }
    }

    originalGlobalValues.clear()
}

/**
 * Reset all workspace and workspace folder configurations
 * @param {vscode.Uri[]} [folderUris] - Workspace folder URIs to reset
 * @returns {Promise<void>}
 */
async function resetWorkspaceConfig(folderUris = []) {
    const config = vscode.workspace.getConfiguration(CONFIGURATION_NAME)
    const keys = ['capitalize', 'textAlignment', 'boxWidth', 'styles', 'wordWrap',
        'maxEndColumn', 'extendSelection', 'commentStartToken', 'commentEndToken',
        'topRightToken', 'bottomLeftToken', 'topEdgeToken', 'bottomEdgeToken',
        'leftEdgeToken', 'rightEdgeToken', 'fillingToken', 'removeEmptyLines',
        'ignoreOuterIndentation', 'ignoreInnerIndentation']

    // Reset workspace-level settings
    for (const key of keys) {
        await config.update(key, undefined, vscode.ConfigurationTarget.Workspace)
    }

    // Reset workspace folder-level settings
    for (const uri of folderUris) {
        const folderConfig = vscode.workspace.getConfiguration(CONFIGURATION_NAME, uri)
        for (const key of keys) {
            await folderConfig.update(key, undefined, vscode.ConfigurationTarget.WorkspaceFolder)
        }
    }
}

/**
 * Get workspace folder URIs for cleanup
 * @returns {vscode.Uri[]}
 */
function getWorkspaceFolderUris() {
    return (vscode.workspace.workspaceFolders || []).map(f => f.uri)
}

/**
 * Open a document from the test workspace
 * @param {string} relativePath - Path relative to first workspace folder
 * @returns {Promise<vscode.TextDocument>}
 */
async function openTestDocument(relativePath) {
    const workspaceFolders = vscode.workspace.workspaceFolders
    if (!workspaceFolders || workspaceFolders.length === 0) {
        throw new Error('No workspace folders found')
    }

    const uri = vscode.Uri.joinPath(workspaceFolders[0].uri, relativePath)
    const document = await vscode.workspace.openTextDocument(uri)
    await vscode.window.showTextDocument(document)
    return document
}

// ============================================================================
// Integration Tests
// ============================================================================

suite('Configuration Integration Tests', function () {
    // Longer timeout for configuration operations
    this.timeout(10000)

    let folderUris

    suiteSetup(async function () {
        folderUris = getWorkspaceFolderUris()

        // Ensure we have a multi-root workspace
        if (folderUris.length < 2) {
            console.warn('Integration tests require a multi-root workspace with at least 2 folders')
        }
    })

    setup(async function () {
        // Open a JS file to ensure activeTextEditor exists
        await openTestDocument('sample.js')

        // Ensure defaultStyle exists in workspace so getDefaultStyleAndConfig works
        // The extension requires styles.defaultStyle to exist at some user-set scope
        await setConfig('styles', { defaultStyle: {} }, vscode.ConfigurationTarget.Workspace)
    })

    teardown(async function () {
        // Clean up all configuration changes after each test
        await restoreGlobalConfig()
        await resetWorkspaceConfig(folderUris)
    })

    suite('Configuration Scope Priority', function () {
        test('workspace value overrides global value', async function () {
            // Set global value
            await setConfig('capitalize', false, vscode.ConfigurationTarget.Global)

            // Verify global value is applied
            let result = getDefaultStyleAndConfig()
            assert.strictEqual(result.config.capitalize, false, 'Global value should be applied')

            // Set workspace value (should override global)
            await setConfig('capitalize', true, vscode.ConfigurationTarget.Workspace)

            // Verify workspace value overrides global
            result = getDefaultStyleAndConfig()
            assert.strictEqual(result.config.capitalize, true, 'Workspace value should override global')
        })

        test('workspaceFolder value overrides workspace value for styles', async function () {
            if (folderUris.length < 1) {
                this.skip()
                return
            }

            // Set workspace-level style
            await setConfig('styles', {
                defaultStyle: {},
                folderTestStyle: {
                    capitalize: false,
                    textAlignment: 'left'
                }
            }, vscode.ConfigurationTarget.Workspace)

            // Verify workspace style is applied
            let result = tryGetStyleAndConfig('folderTestStyle')
            assert.ok(result, 'Style should be found')
            assert.strictEqual(result.config.textAlignment, 'left', 'Workspace value should be applied')

            // Set workspaceFolder style (should override workspace)
            await setConfig('styles', {
                defaultStyle: {},
                folderTestStyle: {
                    textAlignment: 'right'
                }
            }, vscode.ConfigurationTarget.WorkspaceFolder, folderUris[0])

            // Verify workspaceFolder value overrides workspace
            result = tryGetStyleAndConfig('folderTestStyle')
            assert.ok(result, 'Style should still be found')
            assert.strictEqual(result.config.textAlignment, 'right', 'WorkspaceFolder value should override workspace')
        })

        test('full scope priority chain for styles: global < workspace < workspaceFolder', async function () {
            if (folderUris.length < 1) {
                this.skip()
                return
            }

            // Set global style
            await setConfig('styles', {
                defaultStyle: {},
                priorityTestStyle: {
                    boxWidth: 100
                }
            }, vscode.ConfigurationTarget.Global)
            let result = tryGetStyleAndConfig('priorityTestStyle')
            assert.ok(result, 'Style should be found')
            assert.strictEqual(result.config.boxWidth, 100, 'Global should be applied')

            // Set workspace style (should override global)
            await setConfig('styles', {
                defaultStyle: {},
                priorityTestStyle: {
                    boxWidth: 120
                }
            }, vscode.ConfigurationTarget.Workspace)
            result = tryGetStyleAndConfig('priorityTestStyle')
            assert.ok(result, 'Style should be found')
            assert.strictEqual(result.config.boxWidth, 120, 'Workspace should override global')

            // Set workspaceFolder style (should override workspace)
            await setConfig('styles', {
                defaultStyle: {},
                priorityTestStyle: {
                    boxWidth: 140
                }
            }, vscode.ConfigurationTarget.WorkspaceFolder, folderUris[0])
            result = tryGetStyleAndConfig('priorityTestStyle')
            assert.ok(result, 'Style should be found')
            assert.strictEqual(result.config.boxWidth, 140, 'WorkspaceFolder should override workspace')
        })
    })

    suite('Custom Styles', function () {
        test('custom style is available via getStyleList', async function () {
            // Add a custom style at workspace level
            await setConfig('styles', {
                myCustomStyle: {
                    capitalize: true,
                    textAlignment: 'right'
                }
            }, vscode.ConfigurationTarget.Workspace)

            const styleList = getStyleList()
            assert.ok(styleList.includes('myCustomStyle'), 'Custom style should appear in style list')
            assert.ok(styleList.includes('defaultStyle'), 'Default style should always be present')
        })

        test('custom style can be retrieved with tryGetStyleAndConfig', async function () {
            await setConfig('styles', {
                testStyle: {
                    capitalize: false,
                    textAlignment: 'left',
                    boxWidth: 80
                }
            }, vscode.ConfigurationTarget.Workspace)

            const result = tryGetStyleAndConfig('testStyle')
            assert.ok(result, 'Style should be found')
            assert.strictEqual(result.config.capitalize, false)
            assert.strictEqual(result.config.textAlignment, 'left')
            assert.strictEqual(result.config.boxWidth, 80)
        })

        test('style inheritance with basedOn works correctly', async function () {
            await setConfig('styles', {
                parentStyle: {
                    capitalize: true,
                    textAlignment: 'center',
                    boxWidth: 60
                },
                childStyle: {
                    basedOn: 'parentStyle',
                    textAlignment: 'right' // Override parent
                    // capitalize and boxWidth inherited from parent
                }
            }, vscode.ConfigurationTarget.Workspace)

            const result = tryGetStyleAndConfig('childStyle')
            assert.ok(result, 'Child style should be found')
            assert.strictEqual(result.config.capitalize, true, 'Should inherit capitalize from parent')
            assert.strictEqual(result.config.textAlignment, 'right', 'Should override textAlignment')
            assert.strictEqual(result.config.boxWidth, 60, 'Should inherit boxWidth from parent')
        })

        test('hidden styles do not appear in getStyleList', async function () {
            await setConfig('styles', {
                visibleStyle: {
                    capitalize: true
                },
                hiddenStyle: {
                    capitalize: false,
                    hidden: true
                }
            }, vscode.ConfigurationTarget.Workspace)

            const styleList = getStyleList()
            assert.ok(styleList.includes('visibleStyle'), 'Visible style should be in list')
            assert.ok(!styleList.includes('hiddenStyle'), 'Hidden style should not be in list')
        })
    })

    suite('Styles Merging Across Scopes', function () {
        test('styles from different scopes are merged', async function () {
            // Add style at global level
            await setConfig('styles', {
                globalStyle: {
                    capitalize: true
                }
            }, vscode.ConfigurationTarget.Global)

            // Add different style at workspace level
            await setConfig('styles', {
                workspaceStyle: {
                    capitalize: false
                }
            }, vscode.ConfigurationTarget.Workspace)

            const styleList = getStyleList()
            assert.ok(styleList.includes('globalStyle'), 'Global style should be available')
            assert.ok(styleList.includes('workspaceStyle'), 'Workspace style should be available')
        })

        test('workspace style overrides global style with same name', async function () {
            // Add style at global level
            await setConfig('styles', {
                sharedStyle: {
                    capitalize: true,
                    textAlignment: 'left'
                }
            }, vscode.ConfigurationTarget.Global)

            // Override same style at workspace level
            await setConfig('styles', {
                sharedStyle: {
                    capitalize: false
                    // textAlignment not specified - what happens?
                }
            }, vscode.ConfigurationTarget.Workspace)

            const result = tryGetStyleAndConfig('sharedStyle')
            assert.ok(result, 'Shared style should be found')
            // Workspace value should override global for the style's properties
            assert.strictEqual(result.config.capitalize, false, 'Workspace capitalize should override global')
        })
    })

    suite('Language-Specific Configuration', function () {
        test('python-specific settings are applied for Python files', async function () {
            // Open a Python file
            await openTestDocument('sample.py')

            // Get configuration - should pick up Python language defaults
            const result = getDefaultStyleAndConfig()

            // Python defaults use # for comments (from package.json configurationDefaults)
            assert.strictEqual(result.config.commentStartToken, '#',
                'Python should use # as comment start token')
        })

        test('javascript-specific settings are applied for JS files', async function () {
            // Open a JavaScript file  
            await openTestDocument('sample.js')

            // Get configuration
            const result = getDefaultStyleAndConfig()

            // JS uses /* */ style comments (default)
            assert.strictEqual(result.config.commentStartToken, '/*',
                'JavaScript should use /* as comment start token')
        })
    })
})
