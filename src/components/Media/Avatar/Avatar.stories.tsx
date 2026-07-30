import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { Avatar } from "./Avatar";

/**
 * An inline SVG portrait, so the stories render the image path without reaching
 * for the network — which would make them flaky in the test runner.
 */
const PORTRAIT = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#a5b4fc"/>
        <stop offset="1" stop-color="#4f46e5"/>
      </linearGradient>
    </defs>
    <rect width="96" height="96" fill="url(#g)"/>
    <circle cx="48" cy="36" r="15" fill="#ffffff" opacity="0.92"/>
    <path d="M18 96a30 30 0 0 1 60 0z" fill="#ffffff" opacity="0.92"/>
  </svg>`
)}`;

/** A URL that cannot resolve, to show the fallback an image error triggers. */
const BROKEN_PORTRAIT = "/no-such-portrait.jpg";

const Row = ({ children }: { children: ReactNode }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
    {children}
  </div>
);

const Stack = ({ children }: { children: ReactNode }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    {children}
  </div>
);

const meta: Meta<typeof Avatar> = {
  component: Avatar,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A person's picture at one of the library's three control sizes — `sm` 28px, `md` 36px and `lg` 48px — so an avatar lines up with the Button or field beside it. Pass `src` for a photograph; with no `src`, or when the image fails to load, the avatar falls back to `Avatar.Initials`, which draws initials from `name` and takes a colour derived from it so the same person keeps the same one everywhere. With neither, a generic person icon stands in. `shape` picks a circle (the default) or a rounded square, and the optional `status` prop positions a `StatusIndicator` on the edge of the frame: green online, red busy, orange idle, grey offline.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    src: PORTRAIT,
    name: "Ada Lovelace",
    size: "md",
    shape: "circle",
    status: "online",
  },
};

export const Sizes: Story = {
  render: () => (
    <Stack>
      <Row>
        <Avatar src={PORTRAIT} name="Ada Lovelace" size="sm" />
        <Avatar src={PORTRAIT} name="Ada Lovelace" size="md" />
        <Avatar src={PORTRAIT} name="Ada Lovelace" size="lg" />
      </Row>
      <Row>
        <Avatar name="Ada Lovelace" size="sm" />
        <Avatar name="Ada Lovelace" size="md" />
        <Avatar name="Ada Lovelace" size="lg" />
      </Row>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Avatar supports the same three size steps as the rest of the library: `sm` at 28px, `md` at 36px and `lg` at 48px. Each matches the height of the Button and field of that size, so an avatar sits level with the controls in a toolbar or a table row, and its initials take the type size of the matching Button.",
      },
    },
  },
};

export const Shapes: Story = {
  render: () => (
    <Row>
      <Avatar src={PORTRAIT} name="Ada Lovelace" shape="circle" />
      <Avatar src={PORTRAIT} name="Ada Lovelace" shape="square" />
      <Avatar name="Ada Lovelace" shape="circle" />
      <Avatar name="Ada Lovelace" shape="square" />
    </Row>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Avatar is a circle by default, which is the conventional shape for a person. `square` renders a rounded rectangle sharing the field radius of the matching size — use it where avatars sit in a grid of other rectangular tiles, such as an org chart or a card list, so their corners line up with everything around them.",
      },
    },
  },
};

export const Status: Story = {
  render: () => (
    <Stack>
      <Row>
        <Avatar src={PORTRAIT} name="Ada Lovelace" status="online" />
        <Avatar src={PORTRAIT} name="Grace Hopper" status="busy" />
        <Avatar src={PORTRAIT} name="Alan Turing" status="idle" />
        <Avatar src={PORTRAIT} name="Katherine Johnson" status="offline" />
      </Row>
      <Row>
        <Avatar name="Ada Lovelace" status="online" size="sm" />
        <Avatar name="Grace Hopper" status="busy" size="md" />
        <Avatar name="Alan Turing" status="idle" size="lg" />
        <Avatar
          name="Katherine Johnson"
          status="offline"
          shape="square"
          size="lg"
        />
      </Row>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The optional `status` prop renders a `StatusIndicator` on the lower trailing edge: green for `online`, red for `busy`, orange for `idle` and grey for `offline`. The avatar owns only where the dot sits — inset to meet the curve on a circle, in the corner on a square — and the ring that lifts it off the picture behind it; the indicator itself is the same component you can use on its own beside a name. Colour alone never carries the meaning: the dot is announced as "Online", "Busy", "Idle" or "Offline", and `statusLabel` replaces that with something more specific, such as "Away until Monday".',
      },
    },
  },
};

export const Initials: Story = {
  render: () => (
    <Stack>
      <Row>
        <Avatar.Initials name="Ada Lovelace" />
        <Avatar.Initials name="Grace Hopper" />
        <Avatar.Initials name="Katherine Johnson" />
        <Avatar.Initials name="Edsger Dijkstra" />
        <Avatar.Initials name="Barbara Liskov" />
      </Row>
      <Row>
        <Avatar.Initials name="Augusta Ada King-Noel" />
        <Avatar.Initials name="ada.lovelace@example.com" />
        <Avatar.Initials name="ada_lovelace" />
        <Avatar.Initials name="alovelace" />
        <Avatar.Initials name="Ada" />
      </Row>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`Avatar.Initials` turns a display name, an email address or a username into an avatar, and is what an Avatar renders when it has no image. Two letters are used only when the string genuinely names two parts of a person — "Ada Lovelace", "ada.lovelace@example.com", "ada_lovelace" — taken from the first and last part so middle names drop out and a hyphenated surname still reads. Anything that is a single word, such as the username "alovelace" or a mononym, gets one letter rather than an arbitrary second one. The fill colour is derived from the name, so the same person keeps the same colour everywhere without anyone storing one; override `--avatar-color` to pin it.',
      },
    },
  },
};

export const Fallbacks: Story = {
  render: () => (
    <Row>
      <Avatar src={PORTRAIT} name="Ada Lovelace" />
      <Avatar name="Ada Lovelace" />
      <Avatar src={BROKEN_PORTRAIT} name="Ada Lovelace" />
      <Avatar />
    </Row>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The three steps an Avatar falls back through, shown left to right: the image when `src` loads; initials from `name` when no `src` is given; initials again when the `src` given cannot be loaded, so a dead URL never leaves a blank hole; and a generic person icon when there is no name to work with either — for an invitation not yet accepted, say.",
      },
    },
  },
};
