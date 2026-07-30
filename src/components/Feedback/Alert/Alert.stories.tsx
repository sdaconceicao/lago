import type { Meta, StoryObj } from "@storybook/react";
import { Sparkles } from "lucide-react";
import { type ReactNode, useState } from "react";
import { fn } from "storybook/test";
import { Button } from "@/components/Actions/Button/Button";
import { Alert } from "./Alert";

/**
 * Content column for `module` alerts. Inset from the canvas so the rounded
 * corners are read against a margin, the way the type is meant to be used.
 */
const Stack = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 16,
      padding: 24,
      width: "100%",
      boxSizing: "border-box",
    }}
  >
    {children}
  </div>
);

/**
 * Full-bleed container for `fullWidth` alerts. Carries no padding of its own so
 * the band runs to both edges of the canvas — the layout the type assumes.
 */
const Band = ({ children }: { children: ReactNode }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    {children}
  </div>
);

/** Dismissing is caller-owned, so the story holds the visibility itself. */
const DismissibleAlert = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <Button variant="secondary" onPress={() => setIsVisible(true)}>
        Show the alert again
      </Button>
    );
  }

  return (
    <Alert variant="warning">
      <Alert.Header
        title="Storage almost full"
        subtitle="You have used 92% of your plan's storage."
        onDismiss={() => setIsVisible(false)}
      />
    </Alert>
  );
};

const meta: Meta<typeof Alert> = {
  component: Alert,
  parameters: {
    // Fullscreen rather than padded so `fullWidth` examples can actually reach
    // the canvas edges; `module` examples supply their own inset via `Stack`.
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A composable inline message. Compose `Alert.Header`, `Alert.Body` and `Alert.Footer` inside an `Alert`; the header takes a `title` and an optional `subtitle`, and every section other than the one you need can be left out. `variant` sets the tone — `default`, info, success, warning or error — which colours the alert and picks the header's default icon. `type` picks the shape: `module` is rounded and bordered for use inside content, `fullWidth` fills its container with square corners for a page-level band. Body and footer indent to line up under the title whenever the header shows an icon. Button carries the same four hued variant names, so give a footer's leading action the one matching the alert; in a `default` alert use a plain `primary` button.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {
    variant: "default",
    type: "module",
    role: "status",
  },
  render: (args) => {
    // Follows the `type` control so the alert always sits in the container it
    // is designed for: inset for `module`, full bleed for `fullWidth`.
    const Frame = args.type === "fullWidth" ? Band : Stack;

    return (
      <Frame>
        <Alert {...args}>
          <Alert.Header
            title="Scheduled maintenance"
            subtitle="Reporting will be read-only on Sunday from 02:00 to 04:00 UTC."
          />
        </Alert>
      </Frame>
    );
  },
};

export const Variants: Story = {
  render: () => (
    <Stack>
      <Alert variant="default">
        <Alert.Header
          title="Dark mode has arrived"
          subtitle="Switch themes from the account menu."
        />
      </Alert>
      <Alert variant="info">
        <Alert.Header
          title="Scheduled maintenance"
          subtitle="Reporting will be read-only on Sunday from 02:00 to 04:00 UTC."
        />
      </Alert>
      <Alert variant="success">
        <Alert.Header
          title="Invoice sent"
          subtitle="Your customer will receive it within a few minutes."
        />
      </Alert>
      <Alert variant="warning">
        <Alert.Header
          title="Storage almost full"
          subtitle="You have used 92% of your plan's storage."
        />
      </Alert>
      <Alert variant="error">
        <Alert.Header
          title="Payment failed"
          subtitle="We could not charge the card on file."
        />
      </Alert>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Alert supports five variants. `default` is for a message that reports no status of its own: it carries no hue and instead takes the library's own surface and text tokens — the same set Dialog and Popover use — so it reads as white on a light page and a raised grey on a dark one. The other four, info, success, warning and error, each swap a single hue, from which the surface, border, icon and text colours are derived through the shared lightness and chroma scales, so the whole set inverts correctly in dark mode. Every variant also selects the header's default icon.",
      },
    },
  },
};

export const Types: Story = {
  render: () => (
    <>
      <Band>
        <Alert type="fullWidth">
          <Alert.Header
            title="Full width"
            subtitle="Runs to both edges with square corners and hairlines top and bottom, for a banner pinned above a page or section."
          />
        </Alert>
      </Band>
      <Stack>
        <Alert type="module">
          <Alert.Header
            title="Module"
            subtitle="Rounded and fully bordered, inset from the edges and sized to the content it sits in. This is the default."
          />
        </Alert>
      </Stack>
    </>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Alert comes in two types, shown here in the containers each one assumes. `fullWidth` stretches to its container with square corners and borders only on the block edges, so it reads as a band rather than a card — give it a full-bleed parent, as the banner above has. `module` (the default) is a rounded, fully bordered card that belongs inside a padded content column, where the margin around it lets the corners read. Both types share every variant, and both stack their actions at 640px and below.",
      },
    },
  },
};

export const Composition: Story = {
  render: () => (
    <Stack>
      <Alert>
        <Alert.Header title="Title only" />
      </Alert>
      <Alert>
        <Alert.Header
          title="Title and subtitle"
          subtitle="The subtitle is optional and sits under the title."
        />
      </Alert>
      <Alert>
        <Alert.Header title="Title with a body" />
        <Alert.Body>
          The body carries longer form content and indents to line up under the
          title.
        </Alert.Body>
      </Alert>
      <Alert>
        <Alert.Header title="No icon" hideIcon />
        <Alert.Body>
          With hideIcon the gutter closes up and the body sits flush with the
          title.
        </Alert.Body>
      </Alert>
      <Alert>
        <Alert.Body>Body on its own, with no header at all.</Alert.Body>
      </Alert>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The header needs a `title`; everything else is optional. The `subtitle` can be left off, and the header itself can be dropped in favour of a bare `Alert.Body`. `hideIcon` removes the leading icon, and the body and footer close up with it so nothing is left hanging off a phantom gutter. These examples pass no `variant`, so they show the `default` tone.",
      },
    },
  },
};

export const WithActions: Story = {
  render: () => (
    <Stack>
      <Alert variant="error">
        <Alert.Header
          title="Payment failed"
          subtitle="We could not charge the card on file."
        />
        <Alert.Body>
          Your subscription stays active until 14 August. Update your card
          before then to avoid an interruption.
        </Alert.Body>
        <Alert.Footer>
          <Button size="sm" variant="error" onPress={fn()}>
            Update card
          </Button>
          <Button size="sm" variant="secondary" onPress={fn()}>
            Contact support
          </Button>
        </Alert.Footer>
      </Alert>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`Alert.Footer` holds the actions that resolve the message. In a `module` alert they stay below the text at every width, indented to align under the title, because the card is already sized to a content column and has no room beside the message to put them. Give the leading action the Button variant that matches the alert — `variant="error"` here — so the call to action is coloured by the message rather than by the theme tint; a secondary button keeps its grey, and the contrast between the two is what ranks them. At 640px and below the row becomes a stack of full-width buttons and the indent is dropped, so each action keeps a reliable hit target across the whole measure — resize the canvas past that width to see it.',
      },
    },
  },
};

export const FullWidthWithActions: Story = {
  render: () => (
    <Band>
      <Alert variant="warning" type="fullWidth">
        <Alert.Header
          title="Your trial ends in 3 days"
          subtitle="Add a payment method to keep your workspace and its data active."
          onDismiss={fn()}
        />
        <Alert.Footer>
          <Button size="sm" variant="warning" onPress={fn()}>
            Add payment method
          </Button>
          <Button size="sm" variant="secondary" onPress={fn()}>
            Compare plans
          </Button>
        </Alert.Footer>
      </Alert>
      <Alert variant="error" type="fullWidth">
        <Alert.Header
          title="We could not reach the payment provider"
          onDismiss={fn()}
        />
        <Alert.Footer>
          <Button size="sm" variant="error" onPress={fn()}>
            Try again
          </Button>
        </Alert.Footer>
      </Alert>
    </Band>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "A `fullWidth` band has the width to put its actions beside the message rather than beneath it, so above 640px the footer moves to the inline end, vertically centred against the message however many lines it runs to. That keeps a page-level banner one line tall. The dismiss button is pinned to the far corner in this layout — it belongs to the header, so left alone it would land between the message and the actions — and the band reserves that corner so the buttons cannot run underneath it. At 640px and below the band drops back to the stacked layout, with the actions below the message at full width. The second example carries only a title and one action, which is as compact as a banner with a way out of the state gets.",
      },
    },
  },
};

export const Dismissible: Story = {
  render: () => (
    <Stack>
      <DismissibleAlert />
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Passing `onDismiss` to `Alert.Header` renders a dismiss button at the inline end of the header. The alert does not remove itself — the callback fires and the caller decides whether to stop rendering it — so dismissal can be persisted or undone. Relabel the button with `dismissLabel`.",
      },
    },
  },
};

export const WithCustomIcon: Story = {
  render: () => (
    <Stack>
      <Alert variant="success">
        <Alert.Header
          icon={<Sparkles size={20} aria-hidden="true" />}
          title="Dark mode has arrived"
          subtitle="Switch themes from the account menu."
        />
      </Alert>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The `icon` prop replaces the variant's default icon while keeping its colour, which suits announcements that do not map onto a status. Size custom icons at 20px to match the reserved gutter, and mark them `aria-hidden` — the message text carries the meaning.",
      },
    },
  },
};
