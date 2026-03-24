// src/constants.ts

export const PARTICIPANT_ID = 'aide.assistant';
export const EXTENSION_ID = 'aide';
export const EXTENSION_DISPLAY_NAME = 'My Team Copilot';

// Content directory names
export const CONTENT_DIR = 'content';
export const AGENTS_DIR = 'agents';
export const INSTRUCTIONS_DIR = 'instructions';
export const SKILLS_DIR = 'skills';
export const PROMPTS_DIR = 'prompts';
export const HOOKS_DIR = 'hooks';

// Deploy subfolder in user prompts folder
export const DEPLOY_SUBFOLDER = 'aide';

// VSCode configuration key prefix
export const CONFIG_NAMESPACE = 'myTeamCopilot';
export const CONFIG_AUTO_DEPLOY = 'autoDeployAgents';
export const CONFIG_MODEL = 'participantModel';

// File extensions
export const AGENT_EXT = '.agent.md';
export const INSTRUCTIONS_EXT = '.instructions.md';
export const PROMPT_EXT = '.md';

// Command IDs
export const CMD_DEPLOY = 'aide.deploy';
export const CMD_UNDEPLOY = 'aide.undeploy';
export const CMD_LIST = 'aide.list';
export const CMD_REFRESH = 'aide.refresh';
