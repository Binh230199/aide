// src/promptLoader.ts

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { CONTENT_DIR, PROMPTS_DIR } from './constants';

const FALLBACK_PROMPT =
    'You are a helpful coding assistant for the development team. ' +
    'Answer the user\'s question thoroughly and provide code examples when applicable.';

/**
 * Load a system prompt from a bundled .md file in content/prompts/.
 * When a new file is added to content/prompts/, it becomes available automatically —
 * no TypeScript changes required.
 *
 * @param extensionUri Root URI of the extension
 * @param promptName   File name without extension (e.g. "review", "plan", "base")
 * @returns File content, or a fallback prompt if the file is not found
 */
export function loadPrompt(extensionUri: vscode.Uri, promptName: string): string {
    const promptPath = path.join(
        extensionUri.fsPath,
        CONTENT_DIR,
        PROMPTS_DIR,
        `${promptName}.md`
    );

    try {
        if (fs.existsSync(promptPath)) {
            return fs.readFileSync(promptPath, 'utf-8');
        }
    } catch {
        // Fall through to default
    }

    return FALLBACK_PROMPT;
}

/**
 * List all available prompt names found in content/prompts/.
 * Returns bare names without extension (e.g. ["base", "review", "plan", "test"]).
 */
export function listAvailablePrompts(extensionUri: vscode.Uri): string[] {
    const promptsDir = path.join(extensionUri.fsPath, CONTENT_DIR, PROMPTS_DIR);

    try {
        if (fs.existsSync(promptsDir)) {
            return fs
                .readdirSync(promptsDir)
                .filter(f => f.endsWith('.md'))
                .map(f => f.slice(0, -3)); // strip ".md"
        }
    } catch {
        // Return empty on error
    }

    return [];
}
