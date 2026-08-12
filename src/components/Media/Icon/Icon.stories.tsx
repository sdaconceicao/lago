import type { Meta, StoryObj } from "@storybook/react";
import {
  Bell,
  CloudCheck,
  Download,
  Ellipsis,
  icons,
  LucideProvider,
  RefreshCw,
  Search,
  Star,
  Sun,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/Actions/Button/Button";
import { IconButton } from "@/components/Actions/IconButton/IconButton";
import { Alert } from "@/components/Feedback/Alert/Alert";
import { TextFieldWithAffixes } from "@/components/Inputs/TextFieldWithAffixes/TextFieldWithAffixes";
import { IconGallery } from "./IconGallery";

/** Row of labelled samples, so a story reads as a strip of variants. */
const Row = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "flex-end",
      gap: 28,
      color: "var(--text-color)",
      font: "var(--font-size) var(--font-family)",
    }}
  >
    {children}
  </div>
);

/** A sample sitting above the code that produced it. */
const Sample = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      minWidth: 72,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        minHeight: 48,
      }}
    >
      {children}
    </div>
    <code
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 12,
        opacity: 0.7,
      }}
    >
      {label}
    </code>
  </div>
);

/**
 * Props of the playground. They are lucide's own props, which every one of its
 * icons accepts on top of the usual SVG attributes.
 */
interface IconPlaygroundProps {
  /** Export name of the icon to render, in PascalCase. Any name from the Gallery works. */
  name?: string;
  /** Width and height of the rendered `<svg>`, in pixels. Defaults to 24. */
  size?: number;
  /** Stroke colour. `currentColor` — the default — inherits the surrounding text colour. */
  color?: string;
  /** Stroke thickness, in the icon's 24×24 coordinate space. Defaults to 2. */
  strokeWidth?: number;
  /** Holds the stroke at `strokeWidth` pixels however large the icon is drawn, instead of letting it scale up with the icon. */
  absoluteStrokeWidth?: boolean;
}

/** Renders whichever icon the controls name, so every prop stays interactive. */
const IconPlayground = ({
  name = "CircleAlert",
  size = 32,
  color = "currentColor",
  strokeWidth = 2,
  absoluteStrokeWidth = false,
}: IconPlaygroundProps) => {
  const Component = icons[name as keyof typeof icons];

  if (!Component) {
    return (
      <span style={{ font: "var(--font-size) var(--font-family)" }}>
        Nothing is exported as <code>{name}</code>. Names are PascalCase — find
        one in the Gallery story.
      </span>
    );
  }

  return (
    <Component
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      absoluteStrokeWidth={absoluteStrokeWidth}
    />
  );
};

const meta: Meta<IconPlaygroundProps> = {
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `Lago draws every glyph in its own components with [lucide](https://lucide.dev), and ships \`lucide-react\` as a dependency — so the whole set is available to your app without adding an icon library of your own. There is no Lago \`Icon\` wrapper: import the icon you want and render it.

\`\`\`tsx
import { CircleAlert, Search } from "lucide-react";

<Search />
<CircleAlert size={20} />
\`\`\`

Import icons one by one, by name. A namespace import (\`import * as icons from "lucide-react"\`) defeats tree shaking and pulls all of them into your bundle — fine for a catalogue like the Gallery story below, costly in an app.

Each icon renders a 24×24 \`<svg>\` stroked in \`currentColor\`, accepts \`size\`, \`color\`, \`strokeWidth\` and \`absoluteStrokeWidth\` alongside any SVG attribute, and carries \`lucide\` and \`lucide-<name>\` classes for when it is easier to reach an icon from CSS than from props.

**Accessibility.** lucide marks its icons \`aria-hidden\` for you, which is what you want for an icon beside a label. Pass an \`aria-label\` and it stops hiding the icon, so an icon carrying meaning on its own gets a name — either from the control around it or from itself:

\`\`\`tsx
<Button><Trash2 /><span>Delete</span></Button>  {/* label carries the meaning */}
<IconButton aria-label="Delete"><Trash2 /></IconButton> {/* icon-only control */}
<CircleCheck role="img" aria-label="Paid" />    {/* icon standing alone */}
\`\`\`

**Renamed icons.** lucide has reordered many names — \`AlertCircle\` became \`CircleAlert\` — and still exports the old ones as aliases, so existing imports keep working. The Gallery searches those aliases too, so an old name finds where the icon went.

**Icons of your own.** For a glyph lucide does not have, \`createLucideIcon("Name", iconNode)\` builds a component with the same props and stroke defaults, keeping a one-off drawing consistent with the rest.`,
      },
    },
  },
  argTypes: {
    name: {
      control: "text",
      description: "Export name of the icon, in PascalCase.",
    },
    size: {
      control: { type: "range", min: 12, max: 96, step: 2 },
      description: "Width and height in pixels.",
    },
    color: {
      control: "color",
      description: "Stroke colour. Inherits the text colour by default.",
    },
    strokeWidth: {
      control: { type: "range", min: 0.5, max: 3, step: 0.25 },
      description: "Stroke thickness in the icon's 24×24 space.",
    },
    absoluteStrokeWidth: {
      control: "boolean",
      description: "Keep the stroke width fixed as the icon scales.",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<IconPlaygroundProps>;

export const Default: Story = {
  args: {
    name: "CircleAlert",
    size: 32,
    color: "currentColor",
    strokeWidth: 2,
    absoluteStrokeWidth: false,
  },
  render: (args) => <IconPlayground {...args} />,
};

export const Gallery: Story = {
  render: () => <IconGallery />,
  parameters: {
    // The catalogue carries its own padding and fills the canvas, scrolling with
    // it rather than inside a box of its own.
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Every icon `lucide-react` exports. The search matches an icon's name, its hyphenated lucide.dev name, and any name it was renamed from, so `circle alert`, `circle-alert` and `AlertCircle` all lead to `CircleAlert`; several terms all have to match, which is how you narrow `arrow` down to `arrow up right`. Press an icon to copy its import line. Icons render a chunk at a time as you scroll, since mounting all of them at once would be slow.",
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <Row>
      {[16, 20, 24, 32, 48].map((size) => (
        <Sample key={size} label={`size={${size}}`}>
          <Star size={size} />
        </Sample>
      ))}
      <Sample label={`size="1em"`}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 32,
          }}
        >
          <Star size="1em" />
          Aa
        </span>
      </Sample>
    </Row>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`size` sets both width and height, in pixels, and defaults to 24. It also takes a CSS length: `size="1em"` ties the icon to the font size it sits in, which keeps an icon aligned with text that scales. Inside Lago\'s own components you can leave `size` off entirely — Button and the field components size the `<svg>` they contain from CSS.',
      },
    },
  },
};

export const Colors: Story = {
  render: () => (
    <Row>
      <Sample label="currentColor">
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--red)",
          }}
        >
          <Bell size={32} />
          Overdue
        </span>
      </Sample>
      <Sample label="currentColor">
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--link-color)",
          }}
        >
          <Bell size={32} />
          Subscribed
        </span>
      </Sample>
      <Sample label={`color="#e11d48"`}>
        <Bell size={32} color="#e11d48" />
      </Sample>
    </Row>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Icons are stroked in `currentColor`, so they take the colour of the text around them — set `color` on the parent, from a theme token, and the icon follows it into dark mode along with everything else. The `color` prop is the escape hatch for a colour that belongs to the icon alone rather than to its context.",
      },
    },
  },
};

export const StrokeWidth: Story = {
  render: () => (
    <Row>
      {[1, 1.5, 2, 3].map((strokeWidth) => (
        <Sample key={strokeWidth} label={`strokeWidth={${strokeWidth}}`}>
          <Sun size={32} strokeWidth={strokeWidth} />
        </Sample>
      ))}
      <Sample label="size={64}">
        <Sun size={64} />
      </Sample>
      <Sample label="size={64} absoluteStrokeWidth">
        <Sun size={64} absoluteStrokeWidth />
      </Sample>
    </Row>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`strokeWidth` defaults to 2 and is measured in the icon's 24×24 space, so it scales with `size` — a 64px icon draws a stroke over five pixels wide. `absoluteStrokeWidth` pins the stroke to that many real pixels instead, which is what keeps a large icon looking as light as the small ones beside it.",
      },
    },
  },
};

export const GlobalDefaults: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <Row>
        <Sample label="no provider">
          <Bell />
          <Star />
          <Sun />
        </Sample>
      </Row>
      <LucideProvider size={32} strokeWidth={1.25}>
        <Row>
          <Sample label="<LucideProvider size={32} strokeWidth={1.25}>">
            <Bell />
            <Star />
            <Sun />
          </Sample>
        </Row>
      </LucideProvider>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`LucideProvider` sets `size`, `color`, `strokeWidth`, `absoluteStrokeWidth` and `className` for every icon beneath it, so an app that wants lighter or larger icons throughout can say so once instead of at every call site. Props on an individual icon still win.",
      },
    },
  },
};

export const WithComponents: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        maxWidth: 420,
      }}
    >
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "end" }}
      >
        <Button>
          <Download />
          <span>Export</span>
        </Button>
        <Button variant="secondary" size="sm">
          <RefreshCw />
          <span>Retry</span>
        </Button>
        <IconButton variant="secondary" aria-label="More actions">
          <Ellipsis />
        </IconButton>
      </div>
      <TextFieldWithAffixes label="Search" prefix={<Search />} />
      <Alert variant="success">
        <Alert.Header
          icon={<CloudCheck />}
          title="Backup complete"
          subtitle="Last run 4 minutes ago."
        />
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Pass icons to Lago's components unsized. Button and the field components set the width and height of the `<svg>` they contain from CSS, per component size, so an icon handed to a `sm` Button comes out smaller than the same icon in an `lg` one; sizing it yourself only breaks that. A Button holding nothing but an icon becomes a circular icon button, and needs an `aria-label` since there is no text to name it — which is why a Button with both needs its label wrapped in an element: `<Button><Download /><span>Export</span></Button>`. Bare text is a text node, and the CSS that recognises an icon-only Button counts element children only, so an unwrapped label still reads as icon-only and collapses the button to a circle. Where a component takes an icon as a prop — `Alert.Header`'s `icon`, `TextFieldWithAffixes`'s `prefix` — it is a `ReactNode`, so hand it the element rather than the component.",
      },
    },
  },
};
