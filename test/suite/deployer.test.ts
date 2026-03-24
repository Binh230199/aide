// test/suite/deployer.test.ts
// Unit tests for the deployer module.
// Coverage: getUserPromptsFolder, deployContent, undeployContent, listDeployedContent

import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

// We use a temporary directory to avoid touching the real user prompts folder.
// The deployer reads `getUserPromptsFolder()` which relies on env vars, so we
// patch process.env before each test and restore it after.

suite('Deployer', () => {
    let tmpDir: string;
    let originalEnv: NodeJS.ProcessEnv;

    setup(() => {
        // Create an isolated temp directory for each test
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aide-deployer-test-'));
        originalEnv = { ...process.env };
    });

    teardown(() => {
        // Restore env and clean up temp dir
        process.env = originalEnv;
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    // ── getUserPromptsFolder ─────────────────────────────────────────────────

    suite('getUserPromptsFolder', () => {
        test('returns a path ending with Code/User/prompts on Windows', () => {
            // We can only truly exercise the Windows branch on Windows, but we can
            // verify the helper is importable and returns a non-empty string.
            const { getUserPromptsFolder } = require('../../src/deployer');
            const folder: string = getUserPromptsFolder();
            assert.ok(typeof folder === 'string' && folder.length > 0, 'Should return a non-empty string');
            assert.ok(folder.includes('Code'), 'Path should include "Code"');
            assert.ok(folder.endsWith('prompts'), 'Path should end with "prompts"');
        });
    });

    // ── deployContent ────────────────────────────────────────────────────────

    suite('deployContent', () => {
        test('copies .agent.md files to the deploy directory', async () => {
            // Arrange — create a fake extension directory structure
            const fakeExtDir = path.join(tmpDir, 'ext');
            const agentsDir = path.join(fakeExtDir, 'content', 'agents');
            const instructionsDir = path.join(fakeExtDir, 'content', 'instructions');
            fs.mkdirSync(agentsDir, { recursive: true });
            fs.mkdirSync(instructionsDir, { recursive: true });

            fs.writeFileSync(path.join(agentsDir, 'reviewer.agent.md'), '# reviewer');
            fs.writeFileSync(path.join(agentsDir, 'architect.agent.md'), '# architect');
            fs.writeFileSync(path.join(instructionsDir, 'coding-standards.instructions.md'), '# standards');

            // Point the deployer at our tmp folder
            const deployBase = path.join(tmpDir, 'prompts');
            if (process.platform === 'win32') {
                process.env['APPDATA'] = deployBase;
            } else if (process.platform === 'darwin') {
                process.env['HOME'] = deployBase;
            } else {
                process.env['XDG_CONFIG_HOME'] = deployBase;
            }

            // Re-require to pick up patched env
            const { deployContent, getUserPromptsFolder } = require('../../src/deployer');
            const fakeUri = vscode.Uri.file(fakeExtDir);

            // Act
            const result = await deployContent(fakeUri);

            // Assert
            const deployDir = path.join(getUserPromptsFolder(), 'aide');
            assert.strictEqual(result.agents, 2, 'Should deploy 2 agents');
            assert.strictEqual(result.instructions, 1, 'Should deploy 1 instruction file');
            assert.ok(fs.existsSync(path.join(deployDir, 'reviewer.agent.md')), 'reviewer.agent.md should exist');
            assert.ok(fs.existsSync(path.join(deployDir, 'architect.agent.md')), 'architect.agent.md should exist');
            assert.ok(
                fs.existsSync(path.join(deployDir, 'coding-standards.instructions.md')),
                'instructions file should exist'
            );
        });

        test('returns zero counts when content directories are empty', async () => {
            const fakeExtDir = path.join(tmpDir, 'ext-empty');
            const agentsDir = path.join(fakeExtDir, 'content', 'agents');
            const instructionsDir = path.join(fakeExtDir, 'content', 'instructions');
            fs.mkdirSync(agentsDir, { recursive: true });
            fs.mkdirSync(instructionsDir, { recursive: true });

            const deployBase = path.join(tmpDir, 'prompts-empty');
            if (process.platform === 'win32') {
                process.env['APPDATA'] = deployBase;
            } else if (process.platform === 'darwin') {
                process.env['HOME'] = deployBase;
            } else {
                process.env['XDG_CONFIG_HOME'] = deployBase;
            }

            const { deployContent } = require('../../src/deployer');
            const result = await deployContent(vscode.Uri.file(fakeExtDir));

            assert.strictEqual(result.agents, 0);
            assert.strictEqual(result.instructions, 0);
        });

        test('overwrites existing deployed files on re-deploy', async () => {
            const fakeExtDir = path.join(tmpDir, 'ext-overwrite');
            const agentsDir = path.join(fakeExtDir, 'content', 'agents');
            fs.mkdirSync(agentsDir, { recursive: true });
            fs.writeFileSync(path.join(agentsDir, 'reviewer.agent.md'), 'version 1');

            const deployBase = path.join(tmpDir, 'prompts-overwrite');
            if (process.platform === 'win32') {
                process.env['APPDATA'] = deployBase;
            } else if (process.platform === 'darwin') {
                process.env['HOME'] = deployBase;
            } else {
                process.env['XDG_CONFIG_HOME'] = deployBase;
            }

            const { deployContent, getUserPromptsFolder } = require('../../src/deployer');
            const fakeUri = vscode.Uri.file(fakeExtDir);
            await deployContent(fakeUri);

            // Update source, re-deploy
            fs.writeFileSync(path.join(agentsDir, 'reviewer.agent.md'), 'version 2');
            await deployContent(fakeUri);

            const deployDir = path.join(getUserPromptsFolder(), 'aide');
            const content = fs.readFileSync(path.join(deployDir, 'reviewer.agent.md'), 'utf-8');
            assert.strictEqual(content, 'version 2', 'Re-deploy should overwrite with latest content');
        });
    });

    // ── undeployContent ──────────────────────────────────────────────────────

    suite('undeployContent', () => {
        test('removes the aide/ deploy directory', async () => {
            const deployBase = path.join(tmpDir, 'prompts-undeploy');
            if (process.platform === 'win32') {
                process.env['APPDATA'] = deployBase;
            } else if (process.platform === 'darwin') {
                process.env['HOME'] = deployBase;
            } else {
                process.env['XDG_CONFIG_HOME'] = deployBase;
            }

            const { undeployContent, getUserPromptsFolder } = require('../../src/deployer');
            const deployDir = path.join(getUserPromptsFolder(), 'aide');
            fs.mkdirSync(deployDir, { recursive: true });
            fs.writeFileSync(path.join(deployDir, 'test.agent.md'), 'test');

            await undeployContent();

            assert.ok(!fs.existsSync(deployDir), 'Deploy directory should be removed after undeploy');
        });

        test('does not throw when deploy directory does not exist', async () => {
            const deployBase = path.join(tmpDir, 'prompts-nonexistent');
            if (process.platform === 'win32') {
                process.env['APPDATA'] = deployBase;
            } else if (process.platform === 'darwin') {
                process.env['HOME'] = deployBase;
            } else {
                process.env['XDG_CONFIG_HOME'] = deployBase;
            }

            const { undeployContent } = require('../../src/deployer');
            // Should not throw
            await assert.doesNotReject(() => undeployContent());
        });
    });

    // ── listDeployedContent ──────────────────────────────────────────────────

    suite('listDeployedContent', () => {
        test('returns file names of deployed content', async () => {
            const deployBase = path.join(tmpDir, 'prompts-list');
            if (process.platform === 'win32') {
                process.env['APPDATA'] = deployBase;
            } else if (process.platform === 'darwin') {
                process.env['HOME'] = deployBase;
            } else {
                process.env['XDG_CONFIG_HOME'] = deployBase;
            }

            const { listDeployedContent, getUserPromptsFolder } = require('../../src/deployer');
            const deployDir = path.join(getUserPromptsFolder(), 'aide');
            fs.mkdirSync(deployDir, { recursive: true });
            fs.writeFileSync(path.join(deployDir, 'a.agent.md'), '');
            fs.writeFileSync(path.join(deployDir, 'b.instructions.md'), '');

            const files = listDeployedContent();
            assert.ok(files.includes('a.agent.md'), 'Should list a.agent.md');
            assert.ok(files.includes('b.instructions.md'), 'Should list b.instructions.md');
            assert.strictEqual(files.length, 2);
        });

        test('returns empty array when nothing is deployed', async () => {
            const deployBase = path.join(tmpDir, 'prompts-empty-list');
            if (process.platform === 'win32') {
                process.env['APPDATA'] = deployBase;
            } else if (process.platform === 'darwin') {
                process.env['HOME'] = deployBase;
            } else {
                process.env['XDG_CONFIG_HOME'] = deployBase;
            }

            const { listDeployedContent } = require('../../src/deployer');
            const result = listDeployedContent();
            assert.deepStrictEqual(result, []);
        });
    });
});
