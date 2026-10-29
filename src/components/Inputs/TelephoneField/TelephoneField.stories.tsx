import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "@/components/Actions/Button/Button";
import { Form } from "@/components/Inputs/FormComponents/Form/Form";
import { TelephoneField } from "./TelephoneField";

const meta: Meta<typeof TelephoneField> = {
  component: TelephoneField,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A telephone field with a country calling-code dropdown and a mask that formats digits as they are entered. TelephoneField shares TextField's labels, descriptions, validation states, and field sizes. Empty and local values default to the United States. Existing international prefixes are preserved; an explicit country disambiguates a calling code shared by several countries. The trigger shows the calling code, while dropdown options show country names and flags. The placeholder follows the selected country, format, and custom mask unless an explicit `placeholder` is supplied. `onChange` reports the full formatted string, including its calling code, and accepts that string back through `value`. Reset the field by restoring both controlled `value` and `country` props from the parent. Native `form.reset()` is not supported.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    label: "Telephone",
    defaultCountry: "US",
    format: "parentheses",
    onChange: fn(),
    onCountryChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onKeyDown: fn(),
  },
  argTypes: {
    format: {
      control: "select",
      options: ["parentheses", "spaces", "dashes", "digits"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TelephoneField>;

export const Default: Story = {
  args: {
    size: "md",
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <TelephoneField {...args} size="sm" label="Small" />
      <TelephoneField {...args} size="md" label="Medium (default)" />
      <TelephoneField {...args} size="lg" label="Large" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'TelephoneField supports the shared "sm", "md", and "lg" field sizes, with heights of 28px, 36px, and 48px. The calling-code trigger and its dropdown follow the same size, keeping TelephoneField aligned with TextField and CreditCardNumber.',
      },
    },
  },
};

export const States: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <TelephoneField {...args} label="Default" />
      <TelephoneField
        {...args}
        label="With a description"
        description="Include the number where we can reach you."
      />
      <TelephoneField
        {...args}
        label="Invalid"
        defaultValue="212555"
        isInvalid
        errorMessage="Enter a complete telephone number."
      />
      <TelephoneField
        {...args}
        label="Disabled"
        defaultValue="2125550123"
        isDisabled
      />
      <TelephoneField
        {...args}
        label="Read only"
        defaultValue="2125550123"
        isReadOnly
      />
      <TelephoneField {...args} label="Required" isRequired />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "TelephoneField inherits TextField's helper text, error, disabled, read-only, and required states. Disabled and read-only fields also lock the country selector. The form controls validation through `isInvalid`, `errorMessage`, or `validate`.",
      },
    },
  },
};

export const Validation: Story = {
  render: (args) => {
    const [callbackSubmission, setCallbackSubmission] =
      useState("Not submitted");
    const [patternSubmission, setPatternSubmission] = useState("Not submitted");
    const [countrySubmission, setCountrySubmission] = useState("Not submitted");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <Form
          aria-label="Callback validation"
          validationBehavior="native"
          onSubmit={(event) => {
            event.preventDefault();
            setCallbackSubmission(
              JSON.stringify(
                new FormData(event.currentTarget).getAll("telephone")
              )
            );
          }}
        >
          <TelephoneField
            {...args}
            name="telephone"
            label="Callback telephone"
            description="This example accepts +1 (212) 555-0123."
            onlyCountries={["US"]}
            isRequired
            validate={(value) =>
              value && value !== "+1 (212) 555-0123"
                ? "Use the example contact number."
                : null
            }
            errorMessage={({ validationDetails, validationErrors }) =>
              validationDetails.valueMissing
                ? "Enter a telephone number."
                : validationErrors.join(" ")
            }
          />
          <Button type="submit">Submit callback example</Button>
          <output aria-label="Callback submission">{callbackSubmission}</output>
        </Form>
        <Form
          aria-label="Pattern validation"
          validationBehavior="native"
          onSubmit={(event) => {
            event.preventDefault();
            setPatternSubmission(
              JSON.stringify(
                new FormData(event.currentTarget).getAll("telephone")
              )
            );
          }}
        >
          <TelephoneField
            {...args}
            name="telephone"
            label="Pattern telephone"
            description="This example requires ten national digits."
            onlyCountries={["US"]}
            format="digits"
            isRequired
            pattern="[0-9]{10}"
            errorMessage={({ validationDetails }) =>
              validationDetails.valueMissing
                ? "Enter a telephone number."
                : "Use ten national digits."
            }
          />
          <Button type="submit">Submit pattern example</Button>
          <output aria-label="Pattern submission">{patternSubmission}</output>
        </Form>
        <Form
          aria-label="Country validation"
          validationBehavior="native"
          onSubmit={(event) => {
            event.preventDefault();
            setCountrySubmission(
              JSON.stringify(
                new FormData(event.currentTarget).getAll("telephone")
              )
            );
          }}
        >
          <TelephoneField
            {...args}
            name="telephone"
            label="French contact"
            description="This example accepts a French calling code."
            defaultValue="2125550123"
            onlyCountries={["US", "FR"]}
            validate={(value) =>
              value.startsWith("+33 ") ? null : "Choose a French calling code."
            }
            errorMessage={({ validationErrors }) => validationErrors.join(" ")}
          />
          <Button type="submit">Submit country example</Button>
          <output aria-label="Country submission">{countrySubmission}</output>
        </Form>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const callback = within(
      canvas.getByRole("form", { name: "Callback validation" })
    );
    const callbackInput = callback.getByRole("textbox", {
      name: "Callback telephone",
    });
    const callbackSubmit = callback.getByRole("button", {
      name: "Submit callback example",
    });
    const callbackOutput = callback.getByRole("status", {
      name: "Callback submission",
    });

    await step(
      "Required and callback errors block submission until corrected",
      async () => {
        await userEvent.click(callbackSubmit);
        await expect(callbackInput).toBeInvalid();
        await expect(
          callback.getByText("Enter a telephone number.")
        ).toBeVisible();
        await expect(callbackOutput).toHaveTextContent("Not submitted");

        await userEvent.type(callbackInput, "212555");
        await userEvent.click(callbackSubmit);
        await expect(callbackInput).toBeInvalid();
        await expect(
          callback.getByText("Use the example contact number.")
        ).toBeVisible();
        await expect(callbackOutput).toHaveTextContent("Not submitted");

        await userEvent.click(callbackInput);
        await userEvent.keyboard("{End}0123");
        await expect(callbackInput).toHaveValue("(212) 555-0123");
        await userEvent.click(callbackSubmit);
        await expect(callbackInput).toBeValid();
        await expect(callbackOutput).toHaveTextContent('["+1 (212) 555-0123"]');
      }
    );

    await step(
      "Native required and pattern constraints use the national input",
      async () => {
        const pattern = within(
          canvas.getByRole("form", { name: "Pattern validation" })
        );
        const input = pattern.getByRole("textbox", {
          name: "Pattern telephone",
        });
        const submit = pattern.getByRole("button", {
          name: "Submit pattern example",
        });
        const output = pattern.getByRole("status", {
          name: "Pattern submission",
        });

        await userEvent.click(submit);
        await expect(input).toBeInvalid();
        await expect(
          pattern.getByText("Enter a telephone number.")
        ).toBeVisible();
        await expect(output).toHaveTextContent("Not submitted");

        await userEvent.type(input, "212555");
        await userEvent.click(submit);
        await expect(input).toBeInvalid();
        await expect(
          pattern.getByText("Use ten national digits.")
        ).toBeVisible();
        await expect(output).toHaveTextContent("Not submitted");

        await userEvent.click(input);
        await userEvent.keyboard("{End}0123");
        await userEvent.click(submit);
        await expect(input).toBeValid();
        await expect(output).toHaveTextContent('["+1 2125550123"]');
      }
    );

    await step(
      "Country changes clear corrected errors and block newly invalid values",
      async () => {
        const country = within(
          canvas.getByRole("form", { name: "Country validation" })
        );
        const input = country.getByRole<HTMLInputElement>("textbox", {
          name: "French contact",
        });
        const submit = country.getByRole("button", {
          name: "Submit country example",
        });
        const output = country.getByRole("status", {
          name: "Country submission",
        });
        const page = within(canvasElement.ownerDocument.body);

        await userEvent.click(submit);
        await expect(input).toBeInvalid();
        await expect(
          country.getByText("Choose a French calling code.")
        ).toBeVisible();
        await expect(output).toHaveTextContent("Not submitted");

        await userEvent.click(
          country.getByRole("button", { name: /Country calling code/ })
        );
        await userEvent.click(page.getByRole("option", { name: /France/ }));
        await expect(input).toHaveValue("(2) 12-55-50-12");
        await expect(input.validity.valid).toBe(true);
        await expect(input).toBeValid();
        await expect(
          country.queryByText("Choose a French calling code.")
        ).not.toBeInTheDocument();
        await userEvent.click(submit);
        await expect(output).toHaveTextContent('["+33 (2) 12-55-50-12"]');

        await userEvent.click(
          country.getByRole("button", { name: /Country calling code/ })
        );
        await userEvent.click(
          page.getByRole("option", { name: /United States/ })
        );
        await expect(input.validity.valid).toBe(false);
        await userEvent.click(submit);
        await expect(input).toBeInvalid();
        await expect(
          country.getByText("Choose a French calling code.")
        ).toBeVisible();
        await expect(output).toHaveTextContent('["+33 (2) 12-55-50-12"]');
      }
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Consumer validation examples use a callback for one example contact, native `isRequired` and `pattern` constraints with `format="digits"`, and a callback requiring a French calling code. Callbacks receive the full formatted number; native constraints apply to the national input. Selecting a country updates validation alongside the number. Each form displays its submitted FormData locally and prevents navigation. Choose validation rules in the consuming form to match its requirements.',
      },
    },
  },
};

export const Formats: Story = {
  render: (args) => {
    const [fixedValue, setFixedValue] = useState("+55 (11) 98765-4321");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <TelephoneField
          {...args}
          label="Parentheses (default)"
          format="parentheses"
          defaultValue="2125550123"
        />
        <TelephoneField
          {...args}
          label="Spaces"
          format="spaces"
          defaultValue="2125550123"
        />
        <TelephoneField
          {...args}
          label="Dashes"
          format="dashes"
          defaultValue="2125550123"
        />
        <TelephoneField
          {...args}
          label="Digits"
          format="digits"
          defaultValue="2125550123"
        />
        <TelephoneField
          {...args}
          label="Custom mask"
          defaultValue="2125550123"
          mask="###.###.####"
        />
        <TelephoneField
          {...args}
          label="Fixed digit mask (Brazil)"
          defaultCountry="BR"
          onlyCountries={["BR"]}
          mask="(##) 9####-####"
          value={fixedValue}
          onChange={(next) => {
            setFixedValue(next);
            args.onChange?.(next);
          }}
        />
        <output aria-label="Formatted fixed telephone">
          {fixedValue || "Empty"}
        </output>
      </div>
    );
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole<HTMLInputElement>("textbox", {
      name: "Fixed digit mask (Brazil)",
    });
    const output = canvas.getByRole("status", {
      name: "Formatted fixed telephone",
    });
    await step(
      "Type the complete number and delete beside its fixed digit",
      async () => {
        await userEvent.clear(input);
        await userEvent.type(input, "11987654321");
        await expect(input).toHaveValue("(11) 98765-4321");
        await expect(output).toHaveTextContent("+55 (11) 98765-4321");
        input.setSelectionRange(6, 6);
        await userEvent.keyboard("{Backspace}");
        await expect(input).toHaveValue("(18) 97654-321");
        await expect(output).toHaveTextContent("+55 (18) 97654-321");
      }
    );
    await step(
      "Paste with or without the fixed digit without duplication",
      async () => {
        await userEvent.clear(input);
        await userEvent.paste("+55 (11) 98765-4321");
        await expect(input).toHaveValue("(11) 98765-4321");
        await expect(output).toHaveTextContent("+55 (11) 98765-4321");
        await userEvent.clear(input);
        await userEvent.paste("1187654321");
        await expect(input).toHaveValue("(11) 98765-4321");
        await expect(args.onChange).toHaveBeenLastCalledWith(
          "+55 (11) 98765-4321"
        );
      }
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Choose parentheses, spaces, dashes, or digits for the national number. A custom `mask` overrides `format`; each `#` accepts an editable digit, numeric literals stay fixed, and other characters act as separators. Fixed digits are included in `onChange` and count toward the country limit. Matching fixed digits already present in a supplied full number are consumed once; omitted fixed digits are inserted. The Brazilian example controls the emitted value to demonstrate stable roundtrips. In every format, `onChange` includes the country calling code and the formatted number.",
      },
    },
  },
};

export const CountryLists: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <TelephoneField
        {...args}
        label="United States, Canada, and United Kingdom"
        onlyCountries={["US", "CA", "GB"]}
      />
      <TelephoneField
        {...args}
        label="United Kingdom, with North America excluded"
        defaultCountry="GB"
        excludeCountries={["US", "CA"]}
      />
      <TelephoneField
        {...args}
        label="Exclusions take priority"
        onlyCountries={["US", "CA", "GB"]}
        excludeCountries={["CA"]}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Limit the dropdown with `onlyCountries` or remove entries with `excludeCountries`, using ISO country codes. Exclusions take priority when both lists contain a country. Changing the available options preserves the current number and does not silently select a replacement country. Flags load from a CDN when options are displayed.",
      },
    },
  },
};

export const Controlled: Story = {
  args: {
    onlyCountries: ["US", "GB"],
  },
  render: (args) => {
    const [value, setValue] = useState("+1 (212) 555-0123");
    const [country, setCountry] = useState("US");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <TelephoneField
          {...args}
          country={country}
          value={value}
          onChange={(next) => {
            setValue(next);
            args.onChange?.(next);
          }}
          onCountryChange={(next) => {
            setCountry(next);
            args.onCountryChange?.(next);
          }}
        />
        <output aria-label="Formatted telephone">{value || "Empty"}</output>
      </div>
    );
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole<HTMLInputElement>("textbox", {
      name: "Telephone",
    });
    const output = canvas.getByRole("status", { name: "Formatted telephone" });

    await step(
      "Edit through punctuation without losing the caret or digits",
      async () => {
        await userEvent.click(input);
        input.setSelectionRange(6, 6);
        await userEvent.keyboard("{Backspace}");
        await expect(input).toHaveValue("(215) 550-123");
        await userEvent.keyboard("2");
        await expect(input).toHaveValue("(212) 555-0123");
        await expect(output).toHaveTextContent("+1 (212) 555-0123");
      }
    );

    await step(
      "Paste national text and reformat it when the country changes",
      async () => {
        await userEvent.clear(input);
        await userEvent.paste("(415) abc 555-2671");
        await expect(input).toHaveValue("(415) 555-2671");
        await expect(output).toHaveTextContent("+1 (415) 555-2671");

        await userEvent.click(
          canvas.getByRole("button", { name: /Country calling code/ })
        );
        await userEvent.click(
          within(canvasElement.ownerDocument.body).getByRole("option", {
            name: /United Kingdom/,
          })
        );
        await expect(input).toHaveValue("(4155) 552-671");
        await expect(output).toHaveTextContent("+44 (4155) 552-671");
        await expect(args.onCountryChange).toHaveBeenLastCalledWith("GB");
      }
    );

    await step(
      "Paste an international number without repeating its calling code",
      async () => {
        await userEvent.clear(input);
        await userEvent.paste("+44 20 7946 0958");
        await expect(input).toHaveValue("(2079) 460-958");
        await expect(output).toHaveTextContent("+44 (2079) 460-958");
        await expect(args.onChange).toHaveBeenLastCalledWith(
          "+44 (2079) 460-958"
        );
      }
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Control the formatted string and selected country independently with `value`/`onChange` and `country`/`onCountryChange`. This example offers the United States and United Kingdom. Selecting a country preserves the national digits and applies its mask. Digits beyond the new country's maximum length are discarded, so switching back does not restore them.",
      },
    },
  },
};
