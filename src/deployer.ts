// src/deployer.ts

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import {
    CONTENT_DIR,
    AGENTS_DIR,
    INSTRUCTIONS_DIR,
    DEPLOY_SUBFOLDER,
    AGENT_EXT,
    INSTRUCTIONS_EXT,
} from './constants';

/** Result of a deploy operation. */
export interface DeployResult {
    agents: number;
    instructions: number;
    deployDir: string;
}

/**
 * Resolve the VS Code User Prompts folder path.
 *
 * Copilot scans this folder cross-workspace:
 * - Windows : %APPDATA%\Code\User\prompts\
 * - macOS   : ~/Library/Application Support/Code/User/prompts/
 * - Linux   : ~/.config/Code/User/prompts/
 *
 * Reference: https://code.visualstudio.com/docs/copilot/copilot-customization
 */
export function getUserPromptsFolder(): string {
    if (process.platform === 'win32') {
        const appData = process.env['APPDATA'] ?? path.join(process.env['USERPROFILE'] ?? '', 'AppData', 'Roaming');
        return path.join(appData, 'Code', 'User', 'prompts');
    }

    if (process.platform === 'darwin') {
        const home = process.env['HOME'] ?? '';
        return path.join(home, 'Library', 'Application Support', 'Code', 'User', 'prompts');
    }

    // Linux / other
    const configBase = process.env['XDG_CONFIG_HOME'] ?? path.join(process.env['HOME'] ?? '', '.config');
    return path.join(configBase, 'Code', 'User', 'prompts');
}

/**
 * Copy a single file, overwriting if it already exists.
 * Returns true when the file was successfully written.
 */
function copyFile(src: string, dest: string): boolean {
    try {
        fs.copyFileSync(src, dest);
        return true;
    } catch {
        return false;
    }
}

/**
 * Deploy agents and instructions into the user-level prompts folder so that
 * Copilot can discover them across every workspace.
 *
 * Files are placed inside an "aide/" sub-folder to avoid collisions with
 * any customizations the user already has there.
 */
export async function deployContent(extensionUri: vscode.Uri): Promise<DeployResult> {
    const userPromptsDir = getUserPromptsFolder();
    const deployDir = path.join(userPromptsDir, DEPLOY_SUBFOLDER);
    const contentDir = path.join(extensionUri.fsPath, CONTENT_DIR);

    let agentCount = 0;
    let instructionCount = 0;

    // Ensure target directory exists
    fs.mkdirSync(deployDir, { recursive: true });

    // --- Deploy agents (.agent.md) ---
    const agentsSource = path.join(contentDir, AGENTS_DIR);
    if (fs.existsSync(agentsSource)) {
        for (const file of fs.readdirSync(agentsSource)) {
            if (file.endsWith(AGENT_EXT)) {
                const dest = path.join(deployDir, file);
                if (copyFile(path.join(agentsSource, file), dest)) {
                    agentCount++;
                }
            }
        }
    }

    // --- Deploy instructions (.instructions.md) ---
    const instructionsSource = path.join(contentDir, INSTRUCTIONS_DIR);
    if (fs.existsSync(instructionsSource)) {
        for (const file of fs.readdirSync(instructionsSource)) {
            if (file.endsWith(INSTRUCTIONS_EXT)) {
                const dest = path.join(deployDir, file);
                if (copyFile(path.join(instructionsSource, file), dest)) {
                    instructionCount++;
                }
            }
        }
    }

    return { agents: agentCount, instructions: instructionCount, deployDir };
}

/**
 * Remove all files deployed by this extension.
 */
export async function undeployContent(): Promise<void> {
    const deployDir = path.join(getUserPromptsFolder(), DEPLOY_SUBFOLDER);

    if (fs.existsSync(deployDir)) {
        fs.rmSync(deployDir, { recursive: true, force: true });
    }
}

/**
 * List the names of all currently deployed files.
 */
export function listDeployedContent(): string[] {
    const deployDir = path.join(getUserPromptsFolder(), DEPLOY_SUBFOLDER);

    if (!fs.existsSync(deployDir)) {
        return [];
    }

    return fs.readdirSync(deployDir);
}
