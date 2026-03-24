// test/suite/promptLoader.test.ts
// Unit tests for the promptLoader module.
// Coverage: loadPrompt, listAvailablePrompts — happy path, missing file, error recovery

import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

suite('PromptLoader', () => {
    let tmpDir: string;

    setup(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aide-prompts-test-'));
    });

    teardown(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    function makePromptsDir(): string {
        const dir = path.join(tmpDir, 'content', 'prompts');
        fs.mkdirSync(dir, { recursive: true });
        return dir;
    }

    // ── loadPrompt ───────────────────────────────────────────────────────────

    suite('loadPrompt', () => {
        test('returns file content when prompt file exists', () => {
            const dir = makePromptsDir();
            fs.writeFileSync(path.join(dir, 'review.md'), '# Review Prompt\nYou are a reviewer.');

            const { loadPrompt } = require('../../src/promptLoader');
            const uri = vscode.Uri.file(tmpDir);
            const result = loadPrompt(uri, 'review');

            assert.strictEqual(result, '# Review Prompt\nYou are a reviewer.');
        });

        test('returns fallback string when prompt file does not exist', () => {
            makePromptsDir(); // empty, no files

            const { loadPrompt } = require('../../src/promptLoader');
            const uri = vscode.Uri.file(tmpDir);
            const result = loadPrompt(uri, 'nonexistent');

            assert.ok(typeof result === 'string' && result.length > 0, 'Should return a non-empty fallback');
            assert.ok(
                result.toLowerCase().includes('assistant') || result.toLowerCase().includes('helpful'),
                'Fallback should describe a helpful assistant'
            );
        });

        test('returns fallback when prompts directory does not exist', () => {
            // No content/ directory at all
            const { loadPrompt } = require('../../src/promptLoader');
            const uri = vscode.Uri.file(tmpDir);
            const result = loadPrompt(uri, 'base');

            assert.ok(typeof result === 'string' && result.length > 0);
        });

        test('loads the "base" prompt correctly', () => {
            const dir = makePromptsDir();
            fs.writeFileSync(path.join(dir, 'base.md'), 'Base system prompt.');

            const { loadPrompt } = require('../../src/promptLoader');
            const result = loadPrompt(vscode.Uri.file(tmpDir), 'base');

            assert.strictEqual(result, 'Base system prompt.');
        });

        test('loads multi-line content without modification', () => {
            const dir = makePromptsDir();
            const content = '## Title\n\nLine 1\nLine 2\n\n- bullet 1\n- bullet 2\n';
            fs.writeFileSync(path.join(dir, 'plan.md'), content);

            const { loadPrompt } = require('../../src/promptLoader');
            const result = loadPrompt(vscode.Uri.file(tmpDir), 'plan');

            assert.strictEqual(result, content);
        });
    });

    // ── listAvailablePrompts ─────────────────────────────────────────────────

    suite('listAvailablePrompts', () => {
        test('lists all .md files without extension', () => {
            const dir = makePromptsDir();
            fs.writeFileSync(path.join(dir, 'base.md'), '');
            fs.writeFileSync(path.join(dir, 'review.md'), '');
            fs.writeFileSync(path.join(dir, 'plan.md'), '');
            fs.writeFileSync(path.join(dir, 'test.md'), '');

            const { listAvailablePrompts } = require('../../src/promptLoader');
            const result = listAvailablePrompts(vscode.Uri.file(tmpDir));

            assert.ok(result.includes('base'));
            assert.ok(result.includes('review'));
            assert.ok(result.includes('plan'));
            assert.ok(result.includes('test'));
            assert.strictEqual(result.length, 4);
        });

        test('ignores non-.md files', () => {
            const dir = makePromptsDir();
            fs.writeFileSync(path.join(dir, 'base.md'), '');
            fs.writeFileSync(path.join(dir, 'README.txt'), '');
            fs.writeFileSync(path.join(dir, '.DS_Store'), '');

            const { listAvailablePrompts } = require('../../src/promptLoader');
            const result = listAvailablePrompts(vscode.Uri.file(tmpDir));

            assert.deepStrictEqual(result, ['base']);
        });

        test('returns empty array when prompts directory does not exist', () => {
            // No content/ directory
            const { listAvailablePrompts } = require('../../src/promptLoader');
            const result = listAvailablePrompts(vscode.Uri.file(tmpDir));

            assert.deepStrictEqual(result, []);
        });

        test('returns empty array when prompts directory is empty', () => {
            makePromptsDir();

            const { listAvailablePrompts } = require('../../src/promptLoader');
            const result = listAvailablePrompts(vscode.Uri.file(tmpDir));

            assert.deepStrictEqual(result, []);
        });
    });
});
