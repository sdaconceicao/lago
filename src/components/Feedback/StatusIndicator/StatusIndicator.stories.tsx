import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { StatusIndicator } from "./StatusIndicator";

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

/** A dot with the state spelled out next to it, as it reads in a list. */
const Labelled = ({
  status,
  children,
}: {
  status: "online" | "busy" | "idle" | "offline";
  children: ReactNode;
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      font: "var(--font-size) var(--font-family)",
      color: "var(--text-color)",
    }}
  >
    <StatusIndicator status={status} label="" />
    {children}
  </span>
);

const meta: Meta<typeof StatusIndicator> = {
  component: StatusIndicator,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          'A coloured dot reporting whether someone is available: green for `online`, red for `busy`, orange for `idle` and grey for `offline`. Use it on its own beside a name or in a presence list; `Avatar` renders one for you when given a `status`, positioned on the edge of the frame. Hue is the only thing separating the four states visually, so the dot is always announced — "Online", "Busy", "Idle", "Offline" by default, or whatever `label` says. Where the state is already written beside the dot, pass an empty `label` so it is not read out twice.',
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof StatusIndicator>;

export const Default: Story = {
  args: {
    status: "online",
    size: "md",
  },
};

export const Statuses: Story = {
  render: () => (
    <Row>
      <StatusIndicator status="online" />
      <StatusIndicator status="busy" />
      <StatusIndicator status="idle" />
      <StatusIndicator status="offline" />
    </Row>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The four presence states, in the order availability drops off: `online` is green and available, `busy` red for do not disturb, `idle` orange for signed in but away from the keyboard, and `offline` grey for not signed in. The hues come from the theme's named colours, so they shift with the lightness scale between light and dark mode rather than staying fixed.",
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <Row>
      <StatusIndicator status="online" size="sm" />
      <StatusIndicator status="online" size="md" />
      <StatusIndicator status="online" size="lg" />
    </Row>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Three sizes — `sm` at 8px, `md` at 10px and `lg` at 12px — one for each Avatar size, since an Avatar passes its own size straight down to the indicator it renders.",
      },
    },
  },
};

export const WithLabel: Story = {
  render: () => (
    <Stack>
      <Labelled status="online">Online</Labelled>
      <Labelled status="busy">In a meeting</Labelled>
      <Labelled status="idle">Away until Monday</Labelled>
      <Labelled status="offline">Last seen 3 days ago</Labelled>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Beside text that already says what the state is, pass an empty `label` so the dot is treated as decoration and a screen reader reads the sentence once rather than hearing "Idle" ahead of "Away until Monday". Use the default label only where the dot stands alone, as it does on an Avatar.',
      },
    },
  },
};
