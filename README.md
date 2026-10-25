# Lago - Design System

Built off of react-aria-components, Lago provides a set of components, design tokens, and guidelines for how to build applications.

## Installation

Install Lago and its required peers:

```sh
pnpm add @code-x/lago react@^19 react-dom@^19 react-aria-components@^1
```

Import components from the package root and include the styles once in your application:

```tsx
import { Button } from "@code-x/lago";
import "@code-x/lago/styles";
```

### Rich text editor

Apps that do not use `RichTextEditor` do not need any Tiptap packages. To use the editor, install its optional peers alongside Lago:

```sh
pnpm add @tiptap/core@3.32.0 @tiptap/pm@3.32.0 @tiptap/react@3.32.0 \
  @tiptap/starter-kit@3.32.0 @tiptap/extensions@3.32.0 \
  @tiptap/extension-highlight@3.32.0 @tiptap/extension-list@3.32.0 \
  @tiptap/extension-subscript@3.32.0 @tiptap/extension-superscript@3.32.0 \
  @tiptap/extension-text-align@3.32.0
```

This example uses the version installed for Lago's development and verification. Keep all Tiptap packages aligned on a compatible version within Lago's peer dependency ranges.

```tsx
import { RichTextEditor } from "@code-x/lago/rich-text-editor";
import type { RichTextEditorProps } from "@code-x/lago/rich-text-editor";
import "@code-x/lago/styles";
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, engineering standards, validation commands, and pull request guidance.
