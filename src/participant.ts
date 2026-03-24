// src/participant.ts

import * as vscode from 'vscode';
import { PARTICIPANT_ID, CONFIG_NAMESPACE, CONFIG_MODEL } from './constants';
import { loadPrompt } from './promptLoader';

/**
 * Register the @my-team Chat Participant with VS Code.
 * Must be called from extension.activate().
 *
 * Slash commands are defined in package.json → contributes.chatParticipants.
 * Adding a new command requires:
 *   1. Registering it in package.json
 *   2. Adding the matching prompt file in content/prompts/<command>.md
 *
 * No TypeScript changes required for new commands.
 */
export function registerParticipant(
    context: vscode.ExtensionContext
): vscode.ChatParticipant {
    const handler: vscode.ChatRequestHandler = async (
        request: vscode.ChatRequest,
        chatContext: vscode.ChatContext,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ) => {
        // 1. Pick system prompt based on slash command (e.g. /review → "review")
        //    Falls back to "base" when no command is given.
        const promptName = request.command ?? 'base';
        const systemPrompt = loadPrompt(context.extensionUri, promptName);

        // 2. Build conversation messages
        const messages: vscode.LanguageModelChatMessage[] = [
            vscode.LanguageModelChatMessage.Assistant(systemPrompt),
        ];

        // Include prior conversation turns for context continuity
        for (const turn of chatContext.history) {
            if (turn instanceof vscode.ChatRequestTurn) {
                messages.push(vscode.LanguageModelChatMessage.User(turn.prompt));
            } else if (turn instanceof vscode.ChatResponseTurn) {
                const text = turn.response
                    .filter((p): p is vscode.ChatResponseMarkdownPart =>
                        p instanceof vscode.ChatResponseMarkdownPart
                    )
                    .map(p => p.value.value)
                    .join('');
                if (text) {
                    messages.push(vscode.LanguageModelChatMessage.Assistant(text));
                }
            }
        }

        // Add the current user message
        messages.push(vscode.LanguageModelChatMessage.User(request.prompt));

        // 3. Select model
        const config = vscode.workspace.getConfiguration(CONFIG_NAMESPACE);
        const preferredModel = config.get<string>(CONFIG_MODEL, 'gpt-4.1');

        let model: vscode.LanguageModelChat;
        try {
            const models = await vscode.lm.selectChatModels({
                vendor: 'copilot',
                family: preferredModel,
            });

            if (models.length === 0) {
                stream.markdown(
                    '> **My Team Copilot**: No language model available. ' +
                    'Please ensure GitHub Copilot is installed and signed in.'
                );
                return;
            }

            model = models[0];
        } catch {
            stream.markdown(
                '> **My Team Copilot**: Failed to access language model. ' +
                'Please check your Copilot subscription.'
            );
            return;
        }

        // 4. Stream the response
        try {
            const response = await model.sendRequest(messages, {}, token);

            for await (const chunk of response.text) {
                stream.markdown(chunk);
            }
        } catch (err) {
            if (err instanceof vscode.LanguageModelError) {
                stream.markdown(
                    `> **Error** [${err.code}]: ${err.message}`
                );
            } else {
                throw err;
            }
        }
    };

    // Register the participant
    const participant = vscode.chat.createChatParticipant(PARTICIPANT_ID, handler);
    participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'icon.png');

    context.subscriptions.push(participant);

    return participant;
}
