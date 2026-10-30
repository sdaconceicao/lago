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

### Payment logos

Use `CardBrandImage` for a card mark without bundling inline artwork. It loads the detected brand's SVG from a commit-pinned jsDelivr URL and shows a generic card icon when `brand` is `null` or the image fails. `CreditCardNumber` uses this same component; card detection, masking, and validation run locally, and image URLs contain only the brand name.

```tsx
import { CardBrandImage, CreditCardNumber, getCardBrandLogoUrl } from "@code-x/lago";
import "@code-x/lago/styles";

// Empty alt is decorative; give a standalone mark an accessible name.
<CardBrandImage brand="visa" alt="Visa" style={{ width: 78 }} />;

// Serve lowercase brand filenames from your own host or local assets.
<CardBrandImage brand="mastercard" cdnUrl="/assets/cards" alt="Mastercard" />;
<CreditCardNumber label="Card number" cardLogoCdnUrl="/assets/cards" />;

// For your own image renderer, resolve the same URL directly.
const src = getCardBrandLogoUrl("amex", "/assets/cards");
```

Self-hosted directories should contain `visa.svg`, `mastercard.svg`, `amex.svg`, `discover.svg`, `diners.svg`, `jcb.svg`, `unionpay.svg`, and `maestro.svg`, using the same 780 × 500 canvas. Both URL overrides accept a base with or without a trailing slash; an empty base resolves filenames relative to the current page. Image downloads are separate from the JavaScript bundle.

For inline SVGs, install both optional peers. `react-payment-logos` provides the artwork and uses the runtime helpers from `tslib`:

```sh
pnpm add react-payment-logos@^1.1.0 tslib@^2.8.1
```

```tsx
import { Visa, CARD_BRAND_LOGOS } from "@code-x/lago/payment-logos";
import type { CardBrandLogo } from "@code-x/lago/payment-logos";

<Visa role="img" aria-label="Visa" width={78} height={50} />;

const Logo: CardBrandLogo = CARD_BRAND_LOGOS.visa;
```

The optional entry exports `Amex`, `Diners`, `Discover`, `Jcb`, `Maestro`, `Mastercard`, `Unionpay`, and `Visa`. Import individual components when the brand is known; dynamic access through `CARD_BRAND_LOGOS` retains all eight SVGs. Core components and CDN images work without installing either optional peer.

`CARD_BRAND_LOGOS` and the SVG component type `CardBrandLogo` are no longer exported from the package root. Update existing imports to `@code-x/lago/payment-logos` and install its optional peers, or migrate rendering to `CardBrandImage`.

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
