# v1.0.0-beta.30

- Added: `useAgentContext` now provided a `context` property that contains the latest properties about the agent

# v1.0.0-beta.27

- Breaking change: `useAgent` now returns a simplified `run` method with agent lifecycle hooks as parameters
- Added: `status` property in the agent returned by `useAgent`

# v1.0.0-beta.25

- Changed: parallel tool-use is disabled by default

# v1.0.0-beta.24

- Changed: improve tool rendering to agent

# v1.0.0-beta.23

- Added: `useAgentContext` for building custom agents

# v1.0.0-beta.22

- Added: tool name auto-aliasing so you can use the same tool name with different implementations

# v1.0.0-beta.20

- Added: partial support `AgentContext` to allow hierarchical organization of agents
- Changed: improved state and tool description for agent
- Fixed: some characters in tool name will cause error

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
