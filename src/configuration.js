// @ts-check
"use strict"

// The module 'vscode' contains the VS Code extensibility API
const vscode = require('vscode')

/**
 * Define JSDoc types
 * @typedef {import('./comment-box').BoxStyle} BoxStyle
 * 
 * The configuration options a user can set for a box style, which will be used to create a BoxStyle
 * @typedef UserStyleConfig
 * @property {boolean} [capitalize]
 * @property {boolean} [extendSelection]
 * @property {string} [commentStartToken]
 * @property {string} [commentEndToken]
 * @property {string} [topRightToken]
 * @property {string} [bottomLeftToken]
 * @property {string} [topEdgeToken]
 * @property {string} [bottomEdgeToken]
 * @property {string} [leftEdgeToken]
 * @property {string} [rightEdgeToken]
 * @property {string} [fillingToken]
 * @property {number} [boxWidth]
 * @property {number} [maxEndColumn]
 * @property {string} [wordWrap]
 * @property {string} [textAlignment]
 * @property {boolean} [removeEmptyLines]
 * @property {boolean} [ignoreOuterIndentation]
 * @property {boolean} [ignoreInnerIndentation]
 * @property {boolean} [hidden]
 * @property {string[]} [basedOn]
 * 
 * @typedef StyleWithOptions
 * @property {BoxStyle} style - The processed box style ready for rendering
 * @property {boolean} extendSelection - Whether to extend the selection
 */

const DEFAULT_STYLE = 'defaultStyle'
const CONFIGURATION_NAME = 'commentBox'

// VS Code's configuration priority order (verified empirically)
// Language-specific settings have higher priority: language > scope > source
// Listed from HIGHEST to LOWEST priority
const PRIORITY_ORDER = [
      'workspaceFolderLanguageValue',
      'workspaceLanguageValue',
      'globalLanguageValue',
      'workspaceFolderValue',
      'workspaceValue',
      'globalValue',
      'defaultLanguageValue',
      'defaultValue',
]

/**
 * Find the tab size for the current document
 * @returns {number}
 */
function getTabSize() {
      const editor = vscode.window.activeTextEditor
      const languageId = editor.document.languageId
      return vscode.workspace
            .getConfiguration("editor", { uri: editor.document.uri, languageId })
            .get("tabSize")
}

function getStylesConfiguration() {
      const editor = vscode.window.activeTextEditor
      const languageId = editor.document.languageId
      // Use both document URI and languageId as scope to get language-specific settings
      return vscode.workspace.getConfiguration(CONFIGURATION_NAME, {
            uri: editor.document.uri,
            languageId
      }).inspect('styles')
}

/**
 * Normalizes basedOn value to an array of style names
 * @param {string|string[]|undefined} value - The basedOn value
 * @returns {string[]} Array of parent style names
 */
function normalizeBasedOn(value) {
      if (!value) return []
      return Array.isArray(value) ? value : [value]
}

/**
 * Helper to get a property value from a style object at the highest priority level.
 * @param {any} stylesInspection - inspection result for styles
 * @param {string} styleName - the style name
 * @param {string} propName - the property name
 * @returns {any} The value or undefined
 */
function getStyleProperty(stylesInspection, styleName, propName) {
      for (const key of PRIORITY_ORDER) {
            const styleObj = stylesInspection?.[key]?.[styleName]
            if (styleObj?.[propName] !== undefined) {
                  return styleObj[propName]
            }
      }
      return undefined
}

/**
 * Gets the complete configuration for a style by merging top-level and style-specific settings.
 * For each property, follows VS Code's priority order across both top-level and style settings.
 * 
 * Returns null if the style doesn't exist or has errors.
 * @param {string} styleName
 * @returns {UserStyleConfig|null}
 */
function tryGetConfiguration(styleName) {
      const editor = vscode.window.activeTextEditor
      const languageId = editor.document.languageId
      const uri = editor.document.uri
      const scope = { uri, languageId }

      // Get inspections for both top-level and style properties
      const config = vscode.workspace.getConfiguration(CONFIGURATION_NAME, scope)

      const configNames = [
            "capitalize",
            "textAlignment",
            "boxWidth",
            "wordWrap",
            "maxEndColumn",
            "extendSelection",
            "commentStartToken",
            "commentEndToken",
            "topRightToken",
            "bottomLeftToken",
            "topEdgeToken",
            "bottomEdgeToken",
            "leftEdgeToken",
            "rightEdgeToken",
            "fillingToken",
            "removeEmptyLines",
            "ignoreOuterIndentation",
            "ignoreInnerIndentation",
      ]

      // Check if style exists
      const stylesInspection = config.inspect('styles')
      const styleExists = [
            stylesInspection.globalValue,
            stylesInspection.workspaceValue,
            stylesInspection.workspaceFolderValue,
            stylesInspection.globalLanguageValue,
            stylesInspection.workspaceLanguageValue,
            stylesInspection.workspaceFolderLanguageValue,
      ].some(val => val && val[styleName])

      if (!styleExists && styleName !== DEFAULT_STYLE) {
            vscode.window.showErrorMessage(`Style '${styleName}' doesn't exist.`)
            return null
      }

      // Collect basedOn inheritance chain (supports arrays of parents)
      const stylesToMerge = []
      const visitedStyles = new Set()
      const toProcess = [styleName]

      while (toProcess.length > 0) {
            const currentStyleName = toProcess.shift()

            if (visitedStyles.has(currentStyleName)) {
                  vscode.window.showErrorMessage(`Circular style inheritance detected: ${styleName}`)
                  return null
            }
            visitedStyles.add(currentStyleName)
            stylesToMerge.push(currentStyleName)

            // Check if this style has basedOn property (can be string or array)
            const basedOnValue = getStyleProperty(stylesInspection, currentStyleName, 'basedOn')
            const parents = normalizeBasedOn(basedOnValue)

            // Add parents to process queue (they will be checked after current style)
            toProcess.push(...parents)
      }

      // Merge properties: check each property with proper priority
      let result = {}

      for (const propName of configNames) {
            // Check at each priority level: style first, then top-level
            for (const key of PRIORITY_ORDER) {
                  // Check styles in inheritance order (child to parent)
                  for (const styleToMerge of stylesToMerge) {
                        const styleValue = stylesInspection?.[key]?.[styleToMerge]?.[propName]
                        if (styleValue !== undefined) {
                              result[propName] = styleValue
                              break
                        }
                  }

                  // If we found a value in styles, stop checking lower priorities
                  if (result[propName] !== undefined) break

                  // If not in style at this level, check top-level at same level
                  const topLevelInspection = config.inspect(propName)
                  const topValue = topLevelInspection?.[key]
                  if (topValue !== undefined) {
                        result[propName] = topValue
                        break
                  }
            }
      }

      return result
}


/**
 * @param {UserStyleConfig} configuration 
 * @param {number} tabSize 
 * @returns {BoxStyle}
 */
function configurationToStyle(configuration, tabSize) {
      return {
            capitalize: configuration.capitalize,
            startToken: configuration.commentStartToken,
            endToken: configuration.commentEndToken,
            topRightToken: configuration.topRightToken,
            bottomLeftToken: configuration.bottomLeftToken,
            topEdgeToken: configuration.topEdgeToken,
            bottomEdgeToken: configuration.bottomEdgeToken,
            leftEdgeToken: configuration.leftEdgeToken,
            rightEdgeToken: configuration.rightEdgeToken,
            width: configuration.boxWidth,
            maxEndColumn: configuration.maxEndColumn,
            wordWrap: configuration.wordWrap,
            textAlignment: configuration.textAlignment,
            removeEmptyLines: configuration.removeEmptyLines,
            ignoreOuterIndentation: configuration.ignoreOuterIndentation,
            ignoreInnerIndentation: configuration.ignoreInnerIndentation,
            fillingToken: configuration.fillingToken || " ", // Cannot be empty
            tabSize
      }
}

/**
 * @returns {StyleWithOptions|null}
 */
function getDefaultStyleAndConfig() {
      return tryGetStyleAndConfig(DEFAULT_STYLE)
}

/**
 * @returns {StyleWithOptions|null}
 */
function tryGetStyleAndConfig(styleName) {
      const config = tryGetConfiguration(styleName)

      if (!config) {
            return null
      }

      return {
            style: configurationToStyle(config, getTabSize()),
            extendSelection: config.extendSelection
      }
}

function getStyleList() {
      const styles = getStylesConfiguration()
      const configs = [
            styles.globalValue,
            styles.globalLanguageValue,
            styles.workspaceValue,
            styles.workspaceLanguageValue,
            styles.workspaceFolderValue,
            styles.workspaceFolderLanguageValue,
      ]

      // Make a set with all the keys from the configurations
      const styleSet = new Set()
      styleSet.add(DEFAULT_STYLE)
      for (const config of configs) {
            if (config) {
                  for (const style in config) {
                        if (!config[style].hidden) {
                              styleSet.add(style)
                        }
                  }
            }
      }

      // Return the keys as an array
      return [...styleSet]
}

module.exports = {
      getDefaultStyleAndConfig,
      tryGetStyleAndConfig,
      getStyleList,
      CONFIGURATION_NAME,
}