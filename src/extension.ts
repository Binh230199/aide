// src/extension.ts

import * as vscode from 'vscode';
import { registerParticipant } from './participant';
import { registerCommands } from './commands';
import { deployContent } from './deployer';
import { CONFIG_NAMESPACE, CONFIG_AUTO_DEPLOY, EXTENSION_DISPLAY_NAME } from './constants';

export function activate(context: vscode.ExtensionContext): void {
    console.log(`${EXTENSION_DISPLAY_NAME}: activating…`);

    // 1. Register the @my-team chat participant
    registerParticipant(context);

    // 2. Register palette commands (deploy, undeploy, list, refresh)
    registerCommands(context);

    // 3. Auto-deploy agents & instructions on startup (respects user setting)
    const config = vscode.workspace.getConfiguration(CONFIG_NAMESPACE);
    if (config.get<boolean>(CONFIG_AUTO_DEPLOY, true)) {
        deployContent(context.extensionUri)
            .then(result => {
                console.log(
                    `${EXTENSION_DISPLAY_NAME}: auto-deployed ` +
                    `${result.agents} agent(s) and ${result.instructions} instruction(s).`
                );
            })
            .catch(err => {
                // Non-fatal — user can trigger deploy manually via command
                console.error(`${EXTENSION_DISPLAY_NAME}: auto-deploy failed:`, err);
            });
    }

    console.log(`${EXTENSION_DISPLAY_NAME}: activated.`);
}

export function deactivate(): void {
    // Intentionally empty — keep deployed agents/instructions in place
    // so they remain available to Copilot after the extension is deactivated.
    // Use the "Undeploy" command to remove them explicitly.
}
