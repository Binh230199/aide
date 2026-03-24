// src/commands.ts

import * as vscode from 'vscode';
import { deployContent, undeployContent, listDeployedContent } from './deployer';
import { listAvailablePrompts } from './promptLoader';
import { CMD_DEPLOY, CMD_UNDEPLOY, CMD_LIST, CMD_REFRESH, EXTENSION_DISPLAY_NAME } from './constants';

/**
 * Register all VS Code palette commands for the extension.
 * Must be called from extension.activate().
 */
export function registerCommands(context: vscode.ExtensionContext): void {
    // ── Deploy ────────────────────────────────────────────────────────────────
    context.subscriptions.push(
        vscode.commands.registerCommand(CMD_DEPLOY, async () => {
            await vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: `${EXTENSION_DISPLAY_NAME}: Deploying…`,
                    cancellable: false,
                },
                async () => {
                    const result = await deployContent(context.extensionUri);
                    vscode.window.showInformationMessage(
                        `${EXTENSION_DISPLAY_NAME}: Deployed ${result.agents} agent(s) and ` +
                        `${result.instructions} instruction(s) → ${result.deployDir}`
                    );
                }
            );
        })
    );

    // ── Refresh / Re-deploy ───────────────────────────────────────────────────
    context.subscriptions.push(
        vscode.commands.registerCommand(CMD_REFRESH, async () => {
            await vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: `${EXTENSION_DISPLAY_NAME}: Refreshing…`,
                    cancellable: false,
                },
                async () => {
                    await undeployContent();
                    const result = await deployContent(context.extensionUri);
                    vscode.window.showInformationMessage(
                        `${EXTENSION_DISPLAY_NAME}: Refreshed — ` +
                        `${result.agents} agent(s), ${result.instructions} instruction(s).`
                    );
                }
            );
        })
    );

    // ── List ──────────────────────────────────────────────────────────────────
    context.subscriptions.push(
        vscode.commands.registerCommand(CMD_LIST, () => {
            const deployed = listDeployedContent();
            const prompts = listAvailablePrompts(context.extensionUri);

            const lines: string[] = [
                `# ${EXTENSION_DISPLAY_NAME} — Resources`,
                '',
                `## Deployed files (${deployed.length})`,
                ...deployed.map(f => `  • ${f}`),
                '',
                `## Available prompts / commands (${prompts.length})`,
                ...prompts.map(p => `  • /${p}`),
            ];

            const channel = vscode.window.createOutputChannel(EXTENSION_DISPLAY_NAME);
            channel.clear();
            channel.appendLine(lines.join('\n'));
            channel.show(true);
        })
    );

    // ── Undeploy ──────────────────────────────────────────────────────────────
    context.subscriptions.push(
        vscode.commands.registerCommand(CMD_UNDEPLOY, async () => {
            const confirm = await vscode.window.showWarningMessage(
                `${EXTENSION_DISPLAY_NAME}: Remove all deployed agents and instructions?`,
                { modal: true },
                'Remove'
            );

            if (confirm === 'Remove') {
                await undeployContent();
                vscode.window.showInformationMessage(
                    `${EXTENSION_DISPLAY_NAME}: All deployed content removed.`
                );
            }
        })
    );
}
