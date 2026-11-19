import type { Meta, StoryObj } from "@storybook/react";
import { expect, waitFor, within } from "storybook/test";
import { Button } from "@/components/Actions/Button/Button";
import { TextField } from "@/components/Inputs/TextField/TextField";
import css from "./Overrides.module.css";

const meta: Meta = {
  title: "Design Tokens/Overrides",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Public token scopes in practice. Optional inputs can inherit until a component specializes them; locally resolved appearance properties and field metrics require an override on their owning element. See Design Tokens/Reference for the supported names and deprecation policy.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {},
  render: () => (
    <div className={css.examples}>
      <section>
        <h2>Inherited inputs</h2>
        <p>
          This wrapper supplies a purple hue, a 3px border, and a background.
          Buttons inherit the optional hue and border inputs, while resolving
          their own background. Secondary keeps its local gray hue.
        </p>
        <div className={`${css.row} ${css.inherited}`}>
          <Button>Inherited hue</Button>
          <Button variant="secondary">Secondary</Button>
        </div>
      </section>
      <section>
        <h2>Overrides on the button</h2>
        <p>
          The purple reference sets the same inputs directly. The scoped surface
          supplies its background directly, excludes disabled controls, and
          yields to forced colors.
        </p>
        <div className={css.row}>
          <Button className={css.scopedHue}>Scoped hue</Button>
          <Button variant="secondary">Secondary reference</Button>
          <Button>Primary reference</Button>
          <Button className={css.scopedSurface}>Scoped surface</Button>
          <Button className={css.scopedSurface} isDisabled>
            Disabled surface
          </Button>
          <Button isDisabled>Disabled reference</Button>
        </div>
      </section>
    </div>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const root = canvasElement.ownerDocument.documentElement;
    const wasDark = root.classList.contains("dark-mode");
    const inherited = canvas.getByRole("button", { name: "Inherited hue" });
    const scoped = canvas.getByRole("button", { name: "Scoped hue" });
    const secondary = canvas.getByRole("button", {
      name: "Secondary",
    });
    const secondaryReference = canvas.getByRole("button", {
      name: "Secondary reference",
    });
    const surface = canvas.getByRole("button", { name: "Scoped surface" });
    const disabled = canvas.getByRole("button", { name: "Disabled surface" });
    const disabledReference = canvas.getByRole("button", {
      name: "Disabled reference",
    });
    const forcedColors = window.matchMedia("(forced-colors: active)").matches;

    try {
      for (const dark of [false, true]) {
        root.classList.toggle("dark-mode", dark);
        await waitFor(async () => {
          await expect(getComputedStyle(inherited).backgroundColor).toBe(
            getComputedStyle(scoped).backgroundColor
          );
          if (!forcedColors) {
            await expect(getComputedStyle(inherited).boxShadow).toBe(
              getComputedStyle(scoped).boxShadow
            );
            const primary = canvas.getByRole("button", {
              name: "Primary reference",
            });
            await expect(getComputedStyle(inherited).backgroundColor).not.toBe(
              getComputedStyle(primary).backgroundColor
            );
            await expect(getComputedStyle(secondary).backgroundColor).not.toBe(
              getComputedStyle(primary).backgroundColor
            );
          }
          await expect(getComputedStyle(secondary).backgroundColor).toBe(
            getComputedStyle(secondaryReference).backgroundColor
          );
          await expect(getComputedStyle(disabled).backgroundColor).toBe(
            getComputedStyle(disabledReference).backgroundColor
          );
          await expect(getComputedStyle(surface).backgroundColor).toBe(
            forcedColors
              ? getComputedStyle(
                  canvas.getByRole("button", { name: "Primary reference" })
                ).backgroundColor
              : "rgb(24, 48, 72)"
          );
        });

        if (!forcedColors) {
          const resting = getComputedStyle(inherited).backgroundColor;
          await userEvent.hover(inherited);
          await waitFor(async () => {
            await expect(getComputedStyle(inherited).backgroundColor).not.toBe(
              resting
            );
          });
          await userEvent.unhover(inherited);
        }
      }
    } finally {
      await userEvent.unhover(inherited);
      root.classList.toggle("dark-mode", wasDark);
    }
  },
};

export const FieldMetrics: Story = {
  render: () => (
    <div className={`${css.examples} ${css.fields}`}>
      <p>
        A 64px field height inherited from this wrapper loses to each field's
        size boundary. The custom field overrides metrics on that boundary and
        uses the large radius token.
      </p>
      <span className={css.spacingUnit} data-testid="spacing-unit" />
      <TextField size="sm" label="Small" />
      <TextField size="md" label="Medium" />
      <TextField size="lg" label="Large" />
      <TextField size="sm" label="Custom metrics" className={css.scopedField} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Field metrics are locally declared at each data-field-size boundary. Prefer size props, and apply advanced overrides at that same boundary while preserving the inset and reserved-gutter invariants. Root or wrapper metric values do not replace a field's local size declarations.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const spacing = Number.parseFloat(
      getComputedStyle(canvas.getByTestId("spacing-unit")).width
    );
    for (const [label, units] of [
      ["Small", 7],
      ["Medium", 9],
      ["Large", 12],
    ] as const) {
      await expect(
        getComputedStyle(canvas.getByRole("textbox", { name: label })).minHeight
      ).toBe(`${spacing * units}px`);
    }
    const custom = canvas.getByRole("textbox", { name: "Custom metrics" });
    await expect(getComputedStyle(custom).minHeight).toBe("32px");
    await expect(getComputedStyle(custom).borderRadius).toBe(
      getComputedStyle(canvasElement.ownerDocument.documentElement)
        .getPropertyValue("--radius-lg")
        .trim()
    );
  },
};
