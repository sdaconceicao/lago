import type { Meta, StoryFn } from "@storybook/react";
import { expect, fn } from "storybook/test";
import { Switch } from "./Switch";

const meta: Meta<typeof Switch> = {
  component: Switch,
  args: {
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onKeyDown: fn(),
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A toggle control that represents an on/off state, like a physical light switch. Switch is used for binary settings and differs from a checkbox in that it takes effect immediately rather than on form submission.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof Switch>;

export const Example: Story = (args) => <Switch {...args}>Wi-Fi</Switch>;

export const Sizes: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <Switch {...args} size="sm" defaultSelected>
      Small
    </Switch>
    <Switch {...args} size="md" defaultSelected>
      Medium (default)
    </Switch>
    <Switch {...args} size="lg" defaultSelected>
      Large
    </Switch>
  </div>
);

/**
 * Measures the track of every size and proves the relationship the three CSS
 * blocks are built on: the selected handle travels exactly `width − height`, so
 * it lands flush against the trailing edge instead of stopping short or
 * overshooting. Read from the live layout rather than the stylesheet, because a
 * mismatched `translateX` still computes without erroring.
 */
Sizes.play = async ({ canvasElement }) => {
  const measured = [...canvasElement.querySelectorAll(".track")].map(
    (track) => {
      const handle = track.querySelector(".handle");
      if (!handle) throw new Error("switch handle not found");
      const trackRect = track.getBoundingClientRect();
      return {
        width: Math.round(trackRect.width),
        height: Math.round(trackRect.height),
        // The handle is square and starts at the leading edge, so its offset
        // from that edge is the translate the stylesheet applied.
        translate: Math.round(
          handle.getBoundingClientRect().left - trackRect.left
        ),
      };
    }
  );

  expect(measured).toEqual([
    { width: 28, height: 16, translate: 12 },
    { width: 34, height: 20, translate: 14 },
    { width: 38, height: 22, translate: 16 },
  ]);

  for (const track of measured) {
    expect(track.width - track.height, `translate of ${track.width}px`).toBe(
      track.translate
    );
  }
};

Sizes.parameters = {
  docs: {
    description: {
      story:
        'Switch supports three sizes, which scale the track, the label text, and the gap between them: "sm" is a 28x16px track with 12px text, "md" (the default) is 34x20px with 14px text, and "lg" is 38x22px with 14px text. The track deliberately grows more slowly than the fields it accompanies — 22px is about as tall as a switch reads before it stops looking like a switch, so the scale tops out there instead of following the 28/36/48px field heights. A Switch is not a field box, so it does not share the height of a TextField, Select, or DatePicker and will not row-align with them — matching the size only keeps the type and control weight consistent across a form.',
    },
  },
};
