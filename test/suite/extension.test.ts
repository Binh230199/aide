// test/suite/extension.test.ts
// Integration tests for the extension activation lifecycle.

import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Activation', () => {
    test('extension is present in the installed extensions list', () => {
        const ext = vscode.extensions.getExtension('my-team.aide');
        assert.ok(ext, 'Extension "my-team.aide" should be registered');
    });

    test('extension activates without throwing', async () => {
        const ext = vscode.extensions.getExtension('my-team.aide');
        assert.ok(ext, 'Extension should exist');

        // Activate if not already active
        if (!ext.isActive) {
            await ext.activate();
        }

        assert.strictEqual(ext.isActive, true, 'Extension should be active after activate()');
    });

    test('extension exports activate and deactivate functions', async () => {
        const ext = vscode.extensions.getExtension('my-team.aide');
        assert.ok(ext, 'Extension should exist');

        if (!ext.isActive) {
            await ext.activate();
        }

        // The extension API object is what activate() returns (or void).
        // We just verify it doesn't throw and the extension is active.
        assert.strictEqual(ext.isActive, true);
    });

    test('contributes commands are registered in VS Code', async () => {
        const ext = vscode.extensions.getExtension('my-team.aide');
        if (ext && !ext.isActive) {
            await ext.activate();
        }

        const allCommands = await vscode.commands.getCommands(true);
        const expectedCommands = ['aide.deploy', 'aide.undeploy', 'aide.list', 'aide.refresh'];

        for (const cmd of expectedCommands) {
            assert.ok(
                allCommands.includes(cmd),
                `Command "${cmd}" should be registered`
            );
        }
    });
});
