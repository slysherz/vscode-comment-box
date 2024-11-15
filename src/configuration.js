// @ts-check
"use strict"

// The module 'vscode' contains the VS Code extensibility API
const vscode = require('vscode')

/**
 * Define JSDoc types
 * @typedef {import('./comment-box').BoxStyle} BoxStyle
 * 
 * @typedef BoxStyleConfiguration
 * @property {boolean} capitalize
 * @property {boolean} extendSelection
 * @property {string} commentStartToken
 * @property {string} commentEndToken
 * @property {string} topRightToken
 * @property {string} bottomLeftToken
 * @property {string} topEdgeToken
 * @property {string} bottomEdgeToken
 * @property {string} leftEdgeToken
 * @property {string} rightEdgeToken
 * @property {string} fillingToken
 * @property {number} boxWidth
 * @property {number} maxEndColumn
 * @property {string} wordWrap
 * @property {string} textAlignment
 * @property {boolean} removeEmptyLines
 * @property {boolean} ignoreOuterIndentation
 * @property {boolean} ignoreInnerIndentation
 * @property {boolean} hidden
 * @property {string[]} basedOn
 */

const DEFAULT_STYLE = 'defaultStyle'

/**
 * Find the tab size for the current document
 * @returns {number}
 */
function getTabSize() {
      return vscode.workspace
            .getConfiguration("editor", vscode.window.activeTextEditor.document.uri)
            .get("tabSize")
}

function toStringArray(value) {
      if (typeof value === "string") {
            return [value]
      }

      if (!value) {
            return []
      }

      return value
}

/**
 * @returns {BoxStyleConfiguration} 
 */
function loadOldConfiguration() {
      const configuration = vscode.workspace.getConfiguration("commentBox")

      return mergeConfigurations([{
            capitalize: configuration.get("capitalize"),
            textAlignment: configuration.get("textAlignment"),
            boxWidth: configuration.get("boxWidth"),
            extendSelection: configuration.get("extendSelection"),
            commentStartToken: configuration.get("commentStartToken"),
            commentEndToken: configuration.get("commentEndToken"),
            topRightToken: configuration.get("topRightToken"),
            bottomLeftToken: configuration.get("bottomLeftToken"),
            topEdgeToken: configuration.get("topEdgeToken"),
            bottomEdgeToken: configuration.get("bottomEdgeToken"),
            leftEdgeToken: configuration.get("leftEdgeToken"),
            rightEdgeToken: configuration.get("rightEdgeToken"),
            fillingToken: configuration.get("fillingToken"),
            removeEmptyLines: configuration.get("removeEmptyLines"),
            ignoreOuterIndentation: configuration.get("ignoreOuterIndentation"),
            ignoreInnerIndentation: configuration.get("ignoreInnerIndentation"),
            // clearAroundText: configuration.get("textToEdgeSpace")
      }])
}




/**
 * Creates a new configuration by merging a list of configurations. Each configuration might be
 * incomplete, so when no value is provided for some setting, the default value is used
 * @param {object} configurations
 * @returns {BoxStyleConfiguration}
 * @todo Investigate if VSCode can provide these defaults for us
 */
function mergeConfigurations(configurations) {
      // Start with the default configuration
      let result = {
            capitalize: true,
            textAlignment: "center",
            boxWidth: 0,
            maxEndColumn: 0,
            wordWrap: "false",
            extendSelection: true,
            commentStartToken: "/*",
            commentEndToken: "**/",
            topRightToken: "**",
            bottomLeftToken: " **",
            topEdgeToken: "*",
            bottomEdgeToken: "*",
            leftEdgeToken: " * ",
            rightEdgeToken: " *",
            fillingToken: " ",
            removeEmptyLines: true,
            ignoreOuterIndentation: true,
            ignoreInnerIndentation: true,
            hidden: false,
            basedOn: [],
      }

      for (const config of configurations) {
            result = {
                  ...result,
                  ...config
            }
      }

      return result
}


function getStyleConfigurationWithPriority(configuration, styleName) {
      function getIfExists(config, key) {
            if (config && config.hasOwnProperty(key)) {
                  return config[key]
            }

            return {}
      }

      const configs = [
            configuration.globalValue,
            configuration.workspaceFolderValue,
            configuration.workspaceValue,
            configuration.globalLanguageValue,
            configuration.workspaceFolderLanguageValue,
            configuration.workspaceLanguageValue,
      ]

      if (!configs.some(config => config)) {
            return null
      }

      return mergeConfigurations(configs.map(config => getIfExists(config, styleName)))
}

/**
 * Tries to find a configuration with a given name in the user settings. If it doesn't exist, an
 * error notification is shown to the user and null is returned.
 * @param {string} styleName
 */
function tryGetConfiguration(styleName, checked = []) {
      if (checked.includes(styleName)) {
            vscode.window.showErrorMessage(
                  "The following styles refer to each other in a cycle: " +
                  checked.join(", ")
            )

            return null
      }

      const editor = vscode.window.activeTextEditor
      const languageId = editor.document.languageId
      const styles = vscode.workspace.getConfiguration("commentBox", { languageId }).inspect('styles')
      const style = getStyleConfigurationWithPriority(styles, styleName)

      if (!style) {
            if (checked.length) {
                  // Found a broken link
                  const parentStyle = checked[checked.length - 1]
                  vscode.window.showErrorMessage(
                        `Style ${styleName} is based on ${parentStyle}, but the later doesn't exist.`)

            } else {
                  vscode.window.showErrorMessage(`Style ${styleName} doesn't exist.`)
            }

            return null
      }

      const basedOn = toStringArray(style.basedOn)

      let parentStyles = []
      checked.push(styleName)
      for (const parentStyleName of basedOn) {
            const parentStyle = tryGetConfiguration(parentStyleName, checked)

            if (!parentStyle) {
                  // Failed to get parent style for some reason, child also fails
                  return null
            }

            parentStyles.push(parentStyle)
      }

      console.assert(styleName === checked.pop())

      return mergeConfigurations([...parentStyles, style])
}

/**
 * @param {BoxStyleConfiguration} configuration 
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

function styleAndConfig(config) {
      return {
            style: configurationToStyle(config, getTabSize()),
            config
      }
}

/** 
 * @typedef StyleAndConfig
 * @property {BoxStyle} style
 * @property {BoxStyleConfiguration} config
 */

/**
 * @returns {StyleAndConfig|null}
 */
function getDefaultStyleAndConfig() {
      return tryGetStyleAndConfig(DEFAULT_STYLE)
}

/**
 * @returns {StyleAndConfig|null}
 */
function tryGetStyleAndConfig(styleName) {
      const config = tryGetConfiguration(styleName)

      if (!config) {
            return null
      }

      return styleAndConfig(config)
}

function getStyleList() {
      const languageId = vscode.window.activeTextEditor.document.languageId
      const styles = vscode.workspace.getConfiguration("commentBox", { languageId }).inspect('styles')
      const configs = [
            styles.globalValue,
            styles.workspaceFolderValue,
            styles.workspaceValue,
            styles.globalLanguageValue,
            styles.workspaceFolderLanguageValue,
            styles.workspaceLanguageValue,
      ]

      // Make a set with all the keys from the configurations
      const styleSet = new Set()
      styleSet.add(DEFAULT_STYLE)
      for (const config of configs) {
            if (config) {
                  for (const style in config) {
                        if (!styles[style].hidden) {
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
      mergeConfigurations,
}