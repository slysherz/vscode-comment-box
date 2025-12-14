import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'test/**/*.test.js',
	workspaceFolder: './test/test-workspace/test.code-workspace',
});
