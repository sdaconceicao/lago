# lago

React component library / design system (components, Storybook, unit tests).

## Coding standards

The rules below were authored for Cursor (`.cursor/rules/*.mdc`). Claude Code
imports the **content** of each file via the `@`-import lines. Note: Claude Code
does **not** interpret the `.mdc` frontmatter (`globs`, `alwaysApply`), so these
are always in context regardless of which file you're editing — the per-glob
auto-attach behavior from Cursor is not replicated.

@.cursor/rules/react.mdc
@.cursor/rules/pure-functions.mdc
@.cursor/rules/testing-unit-standards.mdc
@.cursor/rules/storybook-stories.mdc

## Not imported: jcodemunch

`.cursor/rules/jcodemunch.mdc` (`alwaysApply: true`) instructs the agent to use
the **jcodemunch MCP server** for all codebase exploration instead of built-in
Read/Grep/Glob. That MCP is not configured in Claude Code, so the rule is left
un-imported — following it would be impossible here.

To enable it: configure the MCP (`claude mcp add jcodemunch ...`), then add this
line to the section above:

    @.cursor/rules/jcodemunch.mdc
