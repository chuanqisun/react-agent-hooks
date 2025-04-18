# v1.0.0-beta.20

- Added: Partial support `AgentContext` to allow hierarchical organization of agents
- Changed: Improved state and tool description for agent
- Fixed: Some characters in tool name will cause error

# v1.0.0-beta.19

- Added: `description` field for state hook
- Added: model override

# v1.0.0-beta.18

- Added: require `dependencies` for memo to prevent infinite loops

# v1.0.0-beta.17

- Added: abortable agent runs

# v1.0.0-beta.16

- Added: `dependencies` field in memo and tool hooks options
- Added: `description` field in tool hook option

# v1.0.0-beta.14

- Added: `enabled` option in all the hooks to dynamically show/hide state/tool
- Added: `useAgentContext` hook to expose tools and states for building a custom agent

# v1.0.0-beta.9

- Initial beta release
