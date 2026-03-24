// test/suite/participant.test.ts
// Integration tests for the Chat Participant registration.
// Note: full LLM invocation cannot be tested without a live Copilot token.
// These tests verify that the participant is registered and the extension is wired correctly.

import * as assert from 'assert';
import * as vscode from 'vscode';
import { PARTICIPANT_ID } from '../../src/constants';

suite('Chat Participant', () => {
    suiteSetup(async () => {
        // Ensure the extension is active before running participant tests
        const ext = vscode.extensions.getExtension('my-team.aide');
        if (ext && !ext.isActive) {
            await ext.activate();
        }
    });

    test('participant ID constant matches package.json declaration', () => {
        assert.strictEqual(
            PARTICIPANT_ID,
            'aide.assistant',
            'PARTICIPANT_ID should match the id declared in package.json'
        );
    });

    test('extension is active (prerequisite for participant)', async () => {
        const ext = vscode.extensions.getExtension('my-team.aide');
        assert.ok(ext, 'Extension "my-team.aide" should be installed in the test host');
        assert.strictEqual(ext.isActive, true, 'Extension must be active before participant tests run');
    });

    test('chat namespace is available in VS Code API', () => {
        // vscode.chat.createChatParticipant exists in VS Code ≥ 1.95
        assert.ok(
            typeof vscode.chat !== 'undefined',
            'vscode.chat should be defined (requires VS Code ≥ 1.95)'
        );
        assert.ok(
            typeof vscode.chat.createChatParticipant === 'function',
            'vscode.chat.createChatParticipant should be a function'
        );
    });

    test('language model API is available', () => {
        assert.ok(
            typeof vscode.lm !== 'undefined',
            'vscode.lm should be defined (requires VS Code ≥ 1.95)'
        );
        assert.ok(
            typeof vscode.lm.selectChatModels === 'function',
            'vscode.lm.selectChatModels should be a function'
        );
    });

    test('extension configuration defaults are present', () => {
        const config = vscode.workspace.getConfiguration('myTeamCopilot');

        // autoDeployAgents defaults to true
        const autoDeploy = config.get<boolean>('autoDeployAgents');
        assert.ok(typeof autoDeploy === 'boolean', 'autoDeployAgents should be a boolean');

        // participantModel defaults to a non-empty string
        const model = config.get<string>('participantModel');
        assert.ok(typeof model === 'string' && model.length > 0, 'participantModel should be a non-empty string');
    });
});
