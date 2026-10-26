import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Form } from "react-aria-components/Form";
import { TelephoneField, type TelephoneFieldProps } from "./TelephoneField";
import { useTelephoneField } from "./TelephoneField.hooks";

const defaultProps = {
  label: "Telephone",
  onlyCountries: ["US", "CA", "GB", "FR", "SB"],
};

const getInput = () => screen.getByRole("textbox", { name: "Telephone" });
const getCountryTrigger = () =>
  screen.getByRole("button", { name: /Country calling code/ });

const ControlledTelephone = ({
  onChange,
  onCountryChange,
  ...props
}: TelephoneFieldProps) => {
  const [value, setValue] = useState(props.defaultValue ?? "");
  const [country, setCountry] = useState("US");

  return (
    <TelephoneField
      {...defaultProps}
      {...props}
      value={value}
      country={country}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      onCountryChange={(next) => {
        setCountry(next);
        onCountryChange?.(next);
      }}
    />
  );
};

describe("TelephoneField", () => {
  it("renders a labelled telephone input with national autocomplete", () => {
    render(<TelephoneField {...defaultProps} />);

    expect(getInput()).toHaveAttribute("type", "tel");
    expect(getInput()).toHaveAttribute("inputmode", "tel");
    expect(getInput()).toHaveAttribute("autocomplete", "tel-national");
    expect(getCountryTrigger()).toHaveTextContent(/^\+1$/);
  });

  it("lets the consumer override autocomplete", () => {
    render(<TelephoneField {...defaultProps} autoComplete="off" />);

    expect(getInput()).toHaveAttribute("autocomplete", "off");
  });

  describe("masking", () => {
    it("formats US national digits as they are entered", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<TelephoneField {...defaultProps} onChange={onChange} />);

      await user.type(getInput(), "2125550123");

      expect(getInput()).toHaveValue("(212) 555-0123");
      expect(onChange).toHaveBeenLastCalledWith("+1 (212) 555-0123");
    });

    it("strips letters and pasted punctuation before applying the mask", async () => {
      const user = userEvent.setup();
      render(<TelephoneField {...defaultProps} />);

      await user.click(getInput());
      await user.paste("(212) abc 555-0123");

      expect(getInput()).toHaveValue("(212) 555-0123");
    });

    it("caps a local number at the selected country's maximum", async () => {
      const user = userEvent.setup();
      render(<TelephoneField {...defaultProps} />);

      await user.type(getInput(), "21255501239999");

      expect(getInput()).toHaveValue("(212) 555-0123");
    });

    it("formats a raw uncontrolled default value", () => {
      render(<TelephoneField {...defaultProps} defaultValue="2125550123" />);

      expect(getInput()).toHaveValue("(212) 555-0123");
    });

    it("formats an international controlled value with an explicit country", () => {
      render(
        <TelephoneField {...defaultProps} country="US" value="+12125550123" />
      );

      expect(getInput()).toHaveValue("(212) 555-0123");
      expect(getCountryTrigger()).toHaveTextContent(/^\+1$/);
    });

    it("accepts its formatted callback string as a controlled value", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ControlledTelephone onChange={onChange} />);

      await user.type(getInput(), "2125550123");

      expect(getInput()).toHaveValue("(212) 555-0123");
      expect(onChange).toHaveBeenCalledTimes(10);
      expect(onChange).toHaveBeenLastCalledWith("+1 (212) 555-0123");
    });

    it.each([
      ["parentheses", "(212) 555-0123"],
      ["spaces", "212 555 0123"],
      ["dashes", "212-555-0123"],
      ["digits", "2125550123"],
    ] as const)("supports the %s format", (format, expected) => {
      render(
        <TelephoneField
          {...defaultProps}
          format={format}
          defaultValue="2125550123"
        />
      );

      expect(getInput()).toHaveValue(expected);
    });

    it("lets a custom mask override the selected format", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <TelephoneField
          {...defaultProps}
          format="dashes"
          mask="###.###.####"
          onChange={onChange}
        />
      );

      await user.type(getInput(), "2125550123");

      expect(getInput()).toHaveValue("212.555.0123");
      expect(onChange).toHaveBeenLastCalledWith("+1 212.555.0123");
    });

    it("reports an empty string when the number is cleared", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <TelephoneField
          {...defaultProps}
          defaultValue="2125550123"
          onChange={onChange}
        />
      );

      await user.clear(getInput());

      expect(getInput()).toHaveValue("");
      expect(onChange).toHaveBeenLastCalledWith("");
      expect(getCountryTrigger()).toHaveTextContent(/^\+1$/);
    });

    it("preserves a different international prefix pasted over a local number", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onCountryChange = vi.fn();
      render(
        <TelephoneField
          {...defaultProps}
          defaultValue="2125550123"
          onChange={onChange}
          onCountryChange={onCountryChange}
        />
      );

      await user.clear(getInput());
      await user.paste("+33 1 23 45 67 89");

      expect(getCountryTrigger()).toHaveTextContent(/^\+33$/);
      expect((getInput() as HTMLInputElement).value.replace(/\D/g, "")).toBe(
        "123456789"
      );
      expect(onChange.mock.lastCall?.[0].replace(/\D/g, "")).toBe(
        "33123456789"
      );
      expect(onCountryChange).not.toHaveBeenCalled();
    });

    it("preserves a shared international calling code without guessing a country", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onCountryChange = vi.fn();
      render(
        <TelephoneField
          {...defaultProps}
          onChange={onChange}
          onCountryChange={onCountryChange}
        />
      );

      await user.click(getInput());
      await user.paste("+44 20 7946 0958");

      expect(getInput()).toHaveValue("2079460958");
      expect(getCountryTrigger()).toHaveTextContent(/^\+44$/);
      expect(onChange).toHaveBeenLastCalledWith("+44 2079460958");
      expect(onCountryChange).not.toHaveBeenCalled();
      await user.click(getCountryTrigger());
      expect(
        screen.getByRole("option", { name: /United Kingdom/ })
      ).toHaveAttribute("aria-selected", "false");
    });

    it("keeps every digit of an unrecognized international prefix", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<TelephoneField {...defaultProps} onChange={onChange} />);

      await user.click(getInput());
      await user.paste("+999 123 4567");

      expect(getInput()).toHaveValue("9991234567");
      expect(onChange).toHaveBeenLastCalledWith("+9991234567");
    });
  });

  describe("country selection", () => {
    it("shows only the calling code in the closed trigger", () => {
      const { container } = render(<TelephoneField {...defaultProps} />);

      expect(getCountryTrigger()).toHaveTextContent(/^\+1$/);
      expect(getCountryTrigger().querySelector("img")).toBeNull();
      expect(container.querySelector("img")).toBeNull();
      expect(getCountryTrigger()).not.toHaveTextContent("United States");
    });

    it("shows country names, calling codes, and decorative flags in options", async () => {
      const user = userEvent.setup();
      render(<TelephoneField {...defaultProps} />);

      await user.click(getCountryTrigger());

      const option = screen.getByRole("option", { name: /Canada/ });
      expect(option).toHaveTextContent("Canada");
      expect(option).toHaveTextContent("+1");
      expect(option.querySelector("img")).toHaveAttribute(
        "aria-hidden",
        "true"
      );
    });

    it("loads option flags from a custom CDN base URL", async () => {
      const user = userEvent.setup();
      render(
        <TelephoneField
          {...defaultProps}
          flagCdnUrl="https://assets.example.test/flags/"
        />
      );

      await user.click(getCountryTrigger());

      expect(
        screen.getByRole("option", { name: /Canada/ }).querySelector("img")
      ).toHaveAttribute("src", "https://assets.example.test/flags/ca.svg");
    });

    it("uses the country code if a localized country name is unavailable", async () => {
      const user = userEvent.setup();
      const getName = vi
        .spyOn(Intl.DisplayNames.prototype, "of")
        .mockReturnValue(undefined);

      try {
        render(<TelephoneField {...defaultProps} onlyCountries={["US"]} />);
        await user.click(getCountryTrigger());

        expect(screen.getByRole("option", { name: /US/ })).toHaveTextContent(
          "US"
        );
      } finally {
        getName.mockRestore();
      }
    });

    it("supports choosing a country with the keyboard", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onCountryChange = vi.fn();
      render(
        <TelephoneField
          {...defaultProps}
          onlyCountries={["US", "GB"]}
          defaultValue="2125550123"
          onChange={onChange}
          onCountryChange={onCountryChange}
        />
      );

      await user.tab();
      expect(getCountryTrigger()).toHaveFocus();
      await user.keyboard("{ArrowDown}{Home}{Enter}");

      expect(getCountryTrigger()).toHaveTextContent(/^\+44$/);
      expect(onCountryChange).toHaveBeenCalledExactlyOnceWith("GB");
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.lastCall?.[0].replace(/\D/g, "")).toBe(
        "442125550123"
      );
    });

    it("disambiguates a shared calling code with an explicit default country", async () => {
      const user = userEvent.setup();
      render(
        <TelephoneField
          {...defaultProps}
          defaultCountry="CA"
          defaultValue="+12125550123"
        />
      );

      await user.click(getCountryTrigger());

      expect(screen.getByRole("option", { name: /Canada/ })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });

    it("selects a country identified by a unique existing calling code", async () => {
      const user = userEvent.setup();
      render(<TelephoneField {...defaultProps} defaultValue="+33123456789" />);

      await user.click(getCountryTrigger());

      expect(screen.getByRole("option", { name: /France/ })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });

    it.each([
      {
        scenario:
          "resolves a unique prefix ahead of the initial country preference",
        props: { defaultCountry: "US" },
        number: "+33123456789",
        callingCode: "+33",
        nationalDigits: "123456789",
        selectedName: "France",
      },
      {
        scenario: "keeps a conflicting controlled country unresolved",
        props: { country: "US" },
        number: "+33123456789",
        callingCode: "+33",
        nationalDigits: "123456789",
        selectedName: null,
      },
      {
        scenario:
          "keeps a shared prefix unresolved despite the initial preference",
        props: { defaultCountry: "US" },
        number: "+442079460958",
        callingCode: "+44",
        nationalDigits: "2079460958",
        selectedName: null,
      },
    ])(
      "$scenario",
      async ({ props, number, callingCode, nationalDigits, selectedName }) => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        const onCountryChange = vi.fn();
        render(
          <TelephoneField
            {...defaultProps}
            {...props}
            defaultValue={number}
            onChange={onChange}
            onCountryChange={onCountryChange}
          />
        );

        expect(getCountryTrigger()).toHaveTextContent(callingCode);
        expect((getInput() as HTMLInputElement).value.replace(/\D/g, "")).toBe(
          nationalDigits
        );
        await user.click(getCountryTrigger());
        const selectedOptions = screen
          .getAllByRole("option")
          .filter((option) => option.getAttribute("aria-selected") === "true");

        if (selectedName) {
          expect(selectedOptions).toHaveLength(1);
          expect(selectedOptions[0]).toHaveAccessibleName(
            new RegExp(selectedName)
          );
        } else {
          expect(selectedOptions).toHaveLength(0);
        }
        expect(onChange).not.toHaveBeenCalled();
        expect(onCountryChange).not.toHaveBeenCalled();
      }
    );

    it("does not guess a country from a shared code even if only one option is allowed", async () => {
      const user = userEvent.setup();
      render(
        <TelephoneField
          {...defaultProps}
          onlyCountries={["US"]}
          defaultValue="+12125550123"
        />
      );

      await user.click(getCountryTrigger());

      expect(
        screen.getByRole("option", { name: /United States/ })
      ).toHaveAttribute("aria-selected", "false");
    });

    it("reports a user country selection and its full number once", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onCountryChange = vi.fn();
      render(
        <TelephoneField
          {...defaultProps}
          defaultValue="2125550123"
          onChange={onChange}
          onCountryChange={onCountryChange}
        />
      );

      await user.click(getCountryTrigger());
      await user.click(screen.getByRole("option", { name: /Canada/ }));

      expect(onCountryChange).toHaveBeenCalledExactlyOnceWith("CA");
      expect(onChange).toHaveBeenCalledExactlyOnceWith("+1 (212) 555-0123");
      expect(getInput()).toHaveValue("(212) 555-0123");
    });

    it("supports controlled country changes alongside the controlled number", async () => {
      const user = userEvent.setup();
      const onCountryChange = vi.fn();
      render(<ControlledTelephone onCountryChange={onCountryChange} />);

      await user.type(getInput(), "2125550123");
      await user.click(getCountryTrigger());
      await user.click(screen.getByRole("option", { name: /Canada/ }));
      await user.click(getCountryTrigger());

      expect(screen.getByRole("option", { name: /Canada/ })).toHaveAttribute(
        "aria-selected",
        "true"
      );
      expect(onCountryChange).toHaveBeenCalledExactlyOnceWith("CA");
    });

    it("retains a controlled country when the parent does not accept a selection", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onCountryChange = vi.fn();
      render(
        <form aria-label="Contact">
          <TelephoneField
            {...defaultProps}
            name="telephone"
            country="US"
            defaultValue="2125550123"
            onChange={onChange}
            onCountryChange={onCountryChange}
          />
        </form>
      );

      await user.click(getCountryTrigger());
      await user.click(screen.getByRole("option", { name: /United Kingdom/ }));

      expect(onCountryChange).toHaveBeenCalledExactlyOnceWith("GB");
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.lastCall?.[0].replace(/\D/g, "")).toBe(
        "442125550123"
      );
      expect(getCountryTrigger()).toHaveTextContent(/^\+1$/);
      expect(getInput()).toHaveValue("(212) 555-0123");
      const form = screen.getByRole("form", {
        name: "Contact",
      }) as HTMLFormElement;
      expect(new FormData(form).get("telephone")).toBe("+1 (212) 555-0123");
      await user.click(getCountryTrigger());
      expect(
        screen.getByRole("option", { name: /United States/ })
      ).toHaveAttribute("aria-selected", "true");
    });

    it("retains the selected country when the parent does not accept a controlled value change", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onCountryChange = vi.fn();
      render(
        <TelephoneField
          {...defaultProps}
          value="+12125550123"
          defaultCountry="US"
          onChange={onChange}
          onCountryChange={onCountryChange}
        />
      );

      await user.click(getCountryTrigger());
      await user.click(screen.getByRole("option", { name: /United Kingdom/ }));

      expect(onCountryChange).toHaveBeenCalledExactlyOnceWith("GB");
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(getCountryTrigger()).toHaveTextContent(/^\+1$/);
      expect(getInput()).toHaveValue("(212) 555-0123");
      await user.click(getCountryTrigger());
      expect(
        screen.getByRole("option", { name: /United States/ })
      ).toHaveAttribute("aria-selected", "true");
    });

    it("discards overflowing national digits when switching to a shorter country", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <TelephoneField
          {...defaultProps}
          defaultValue="2125550123"
          onChange={onChange}
        />
      );

      await user.click(getCountryTrigger());
      await user.click(screen.getByRole("option", { name: /Solomon Islands/ }));

      expect((getInput() as HTMLInputElement).value.replace(/\D/g, "")).toBe(
        "2125550"
      );
      expect(onChange.mock.lastCall?.[0].replace(/\D/g, "")).toBe("6772125550");

      await user.click(getCountryTrigger());
      await user.click(screen.getByRole("option", { name: /United States/ }));

      expect((getInput() as HTMLInputElement).value.replace(/\D/g, "")).toBe(
        "2125550"
      );
      expect(onChange.mock.lastCall?.[0].replace(/\D/g, "")).toBe("12125550");
    });

    it("does not emit changes when controlled props change", () => {
      const onChange = vi.fn();
      const onCountryChange = vi.fn();
      const { rerender } = render(
        <TelephoneField
          {...defaultProps}
          country="US"
          value="+12125550123"
          onChange={onChange}
          onCountryChange={onCountryChange}
        />
      );

      rerender(
        <TelephoneField
          {...defaultProps}
          country="CA"
          value="+16475550123"
          onChange={onChange}
          onCountryChange={onCountryChange}
        />
      );

      expect(getInput()).toHaveValue("(647) 555-0123");
      expect(onChange).not.toHaveBeenCalled();
      expect(onCountryChange).not.toHaveBeenCalled();
    });

    it("applies exclusions after the allowed country list", async () => {
      const user = userEvent.setup();
      render(
        <TelephoneField
          {...defaultProps}
          onlyCountries={["US", "CA", "GB"]}
          excludeCountries={["CA"]}
        />
      );

      await user.click(getCountryTrigger());

      expect(screen.getAllByRole("option")).toHaveLength(2);
      expect(
        screen.getByRole("option", { name: /United States/ })
      ).toBeVisible();
      expect(
        screen.getByRole("option", { name: /United Kingdom/ })
      ).toBeVisible();
      expect(screen.queryByRole("option", { name: /Canada/ })).toBeNull();
    });

    it("does not replace a country when its option is filtered out", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onCountryChange = vi.fn();
      const { rerender } = render(
        <TelephoneField
          {...defaultProps}
          defaultValue="2125550123"
          onChange={onChange}
          onCountryChange={onCountryChange}
        />
      );

      rerender(
        <TelephoneField
          {...defaultProps}
          defaultValue="2125550123"
          onlyCountries={["GB", "FR"]}
          onChange={onChange}
          onCountryChange={onCountryChange}
        />
      );
      expect(getInput()).toHaveValue("2125550123");
      await user.click(getCountryTrigger());

      expect(
        screen
          .getAllByRole("option")
          .some(
            (option) =>
              option.hasAttribute("aria-selected") &&
              option.getAttribute("aria-selected") === "true"
          )
      ).toBe(false);
      expect(onChange).not.toHaveBeenCalled();
      expect(onCountryChange).not.toHaveBeenCalled();
    });

    it("leaves the number editable when no country options are available", async () => {
      const user = userEvent.setup();
      render(
        <TelephoneField
          {...defaultProps}
          onlyCountries={[]}
          defaultValue="2125550123"
        />
      );

      expect(getCountryTrigger()).toBeDisabled();
      expect(getInput()).toHaveValue("2125550123");
      await user.clear(getInput());
      await user.type(getInput(), "6475550123");

      expect(getInput()).toHaveValue("6475550123");
    });

    it("preserves an international number that conflicts with the selected country", () => {
      const onChange = vi.fn();
      const onCountryChange = vi.fn();
      render(
        <form aria-label="Contact">
          <TelephoneField
            {...defaultProps}
            country="US"
            defaultValue="+442079460958"
            name="telephone"
            onChange={onChange}
            onCountryChange={onCountryChange}
          />
        </form>
      );

      const form = screen.getByRole("form", {
        name: "Contact",
      }) as HTMLFormElement;
      expect(
        String(new FormData(form).get("telephone")).replace(/\D/g, "")
      ).toBe("442079460958");
      expect(getCountryTrigger()).toHaveTextContent(/^\+44$/);
      expect(onChange).not.toHaveBeenCalled();
      expect(onCountryChange).not.toHaveBeenCalled();
    });

    it("keeps edits and clearing of a conflicting international number in sync", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onCountryChange = vi.fn();
      render(
        <form aria-label="Contact">
          <TelephoneField
            {...defaultProps}
            country="US"
            defaultValue="+442079460958"
            name="telephone"
            onChange={onChange}
            onCountryChange={onCountryChange}
          />
        </form>
      );
      const form = screen.getByRole("form", {
        name: "Contact",
      }) as HTMLFormElement;

      await user.type(getInput(), "{Backspace}");

      expect(getInput()).toHaveValue("207946095");
      expect(onChange).toHaveBeenLastCalledWith("+44 207946095");
      expect(new FormData(form).get("telephone")).toBe(
        onChange.mock.lastCall?.[0]
      );

      await user.clear(getInput());

      expect(getInput()).toHaveValue("");
      expect(onChange).toHaveBeenLastCalledWith("");
      expect(new FormData(form).get("telephone")).toBe("");
      expect(onCountryChange).not.toHaveBeenCalled();
    });
  });

  describe("caret handling", () => {
    it("keeps the caret with digits inserted in the middle", async () => {
      const user = userEvent.setup();
      render(<TelephoneField {...defaultProps} defaultValue="212555" />);

      await user.type(getInput(), "9", {
        initialSelectionStart: 2,
        initialSelectionEnd: 2,
      });

      expect(getInput()).toHaveValue("(291) 255-5");
      expect(getInput()).toHaveProperty("selectionStart", 3);
    });

    it("deletes a digit when Backspace lands after parentheses and a space", async () => {
      const user = userEvent.setup();
      render(<TelephoneField {...defaultProps} defaultValue="212555" />);

      await user.type(getInput(), "{Backspace}", {
        initialSelectionStart: 6,
        initialSelectionEnd: 6,
      });

      expect(getInput()).toHaveValue("(215) 55");
    });

    it("deletes the next digit when Delete lands before separators", async () => {
      const user = userEvent.setup();
      render(<TelephoneField {...defaultProps} defaultValue="212555" />);

      await user.type(getInput(), "{Delete}", {
        initialSelectionStart: 4,
        initialSelectionEnd: 4,
      });

      expect(getInput()).toHaveValue("(212) 55");
    });

    it("deletes a selection containing digits and separators", async () => {
      const user = userEvent.setup();
      render(<TelephoneField {...defaultProps} defaultValue="2125550123" />);

      await user.type(getInput(), "{Backspace}", {
        initialSelectionStart: 6,
        initialSelectionEnd: 10,
      });

      expect(getInput()).toHaveValue("(212) 012-3");
    });

    it("honors a consumer key handler that prevents deletion", async () => {
      const user = userEvent.setup();
      const onKeyDown = vi.fn((event) => {
        if (event.key === "Backspace") {
          event.preventDefault();
        }
      });
      render(
        <TelephoneField
          {...defaultProps}
          defaultValue="212555"
          onKeyDown={onKeyDown}
        />
      );

      await user.type(getInput(), "{Backspace}", {
        initialSelectionStart: 6,
        initialSelectionEnd: 6,
      });

      expect(onKeyDown).toHaveBeenCalled();
      expect(getInput()).toHaveValue("(212) 555");
      expect(getInput()).toHaveProperty("selectionStart", 6);
    });
  });

  describe("field integration", () => {
    it("associates helper text with the input", () => {
      render(
        <TelephoneField
          {...defaultProps}
          description="We use this for delivery."
        />
      );

      expect(getInput()).toHaveAccessibleDescription(
        "We use this for delivery."
      );
    });

    it("shows the form's error message when invalid", () => {
      render(
        <TelephoneField
          {...defaultProps}
          isInvalid
          errorMessage="Check the number."
        />
      );

      expect(getInput()).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByText("Check the number.")).toBeInTheDocument();
    });

    it("associates server validation errors with the named visible field", () => {
      render(
        <Form validationErrors={{ phone: "Invalid phone" }}>
          <TelephoneField
            {...defaultProps}
            name="phone"
            errorMessage={(validation) =>
              validation.validationErrors.join(", ")
            }
          />
        </Form>
      );

      expect(getInput()).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByText("Invalid phone")).toBeInTheDocument();
    });

    it("keeps an error message hidden while valid", () => {
      render(
        <TelephoneField {...defaultProps} errorMessage="Check the number." />
      );

      expect(screen.queryByText("Check the number.")).toBeNull();
    });

    it.each(["isDisabled", "isReadOnly"] as const)(
      "locks the country selector when %s",
      async (state) => {
        const user = userEvent.setup();
        render(<TelephoneField {...defaultProps} {...{ [state]: true }} />);

        expect(getCountryTrigger()).toBeDisabled();
        await user.click(getCountryTrigger());

        expect(screen.queryByRole("listbox")).toBeNull();
        if (state === "isDisabled") {
          expect(getInput()).toBeDisabled();
        } else {
          expect(getInput()).toHaveAttribute("readonly");
        }
      }
    );

    it("marks the visible input required", () => {
      render(<TelephoneField {...defaultProps} isRequired />);

      expect(getInput()).toBeRequired();
    });

    it("blocks a required form while empty and allows it after entering a number", async () => {
      const user = userEvent.setup();
      render(
        <form aria-label="Contact">
          <TelephoneField {...defaultProps} name="telephone" isRequired />
        </form>
      );
      const form = screen.getByRole("form", {
        name: "Contact",
      }) as HTMLFormElement;

      expect(form.checkValidity()).toBe(false);
      await user.type(getInput(), "2125550123");

      expect(form.checkValidity()).toBe(true);
      expect(new FormData(form).get("telephone")).toBe("+1 (212) 555-0123");
    });

    it("passes the full formatted number to a form validator", async () => {
      const user = userEvent.setup();
      const validate = vi.fn(() => null);
      render(<TelephoneField {...defaultProps} validate={validate} />);

      await user.type(getInput(), "2125550123");
      await user.tab();

      expect(validate).toHaveBeenLastCalledWith("+1 (212) 555-0123");
    });

    it("renders the consumer's placeholder", () => {
      render(<TelephoneField {...defaultProps} placeholder="Enter a number" />);

      expect(getInput()).toHaveAttribute("placeholder", "Enter a number");
    });

    it("forwards an object input ref", () => {
      const inputRef = { current: null as HTMLInputElement | null };
      render(<TelephoneField {...defaultProps} inputRef={inputRef} />);

      expect(inputRef.current).toBe(getInput());
    });

    it("forwards a callback input ref", () => {
      const inputRef = vi.fn();
      render(<TelephoneField {...defaultProps} inputRef={inputRef} />);

      expect(inputRef).toHaveBeenCalledWith(getInput());
    });

    it.each(["sm", "md", "lg"] as const)(
      "uses the shared %s field size",
      (size) => {
        const { container } = render(
          <TelephoneField {...defaultProps} size={size} />
        );

        expect(container.querySelector("[data-field-size]")).toHaveAttribute(
          "data-field-size",
          size
        );
        expect(getInput()).not.toHaveAttribute("size");
      }
    );

    it("submits the full formatted string once through the field name", () => {
      render(
        <form aria-label="Contact">
          <TelephoneField
            {...defaultProps}
            defaultValue="2125550123"
            name="telephone"
          />
        </form>
      );

      const form = screen.getByRole("form", {
        name: "Contact",
      }) as HTMLFormElement;
      expect(new FormData(form).getAll("telephone")).toEqual([
        "+1 (212) 555-0123",
      ]);
    });

    it("submits an empty value after clearing a named telephone", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <form aria-label="Contact">
          <TelephoneField
            {...defaultProps}
            defaultValue="2125550123"
            name="telephone"
            onChange={onChange}
          />
        </form>
      );

      await user.clear(getInput());

      const form = screen.getByRole("form", {
        name: "Contact",
      }) as HTMLFormElement;
      expect(new FormData(form).getAll("telephone")).toEqual([""]);
      expect(onChange).toHaveBeenCalledExactlyOnceWith("");
    });

    it("reports and submits the same raw digits when the default country is excluded", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <form aria-label="Contact">
          <TelephoneField
            {...defaultProps}
            name="telephone"
            onlyCountries={["GB"]}
            onChange={onChange}
          />
        </form>
      );

      await user.type(getInput(), "2125550123");

      expect(getInput()).toHaveValue("2125550123");
      expect(getCountryTrigger()).toHaveTextContent(/^\+1$/);
      expect(onChange).toHaveBeenLastCalledWith("+1 2125550123");
      const form = screen.getByRole("form", {
        name: "Contact",
      }) as HTMLFormElement;
      expect(new FormData(form).get("telephone")).toBe(
        onChange.mock.lastCall?.[0]
      );
    });

    it("reports and submits the same raw digits when a pasted country is excluded", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <form aria-label="Contact">
          <TelephoneField
            {...defaultProps}
            name="telephone"
            onlyCountries={["US"]}
            onChange={onChange}
          />
        </form>
      );

      await user.click(getInput());
      await user.paste("+33123456789");

      expect(getInput()).toHaveValue("123456789");
      expect(getCountryTrigger()).toHaveTextContent(/^\+33$/);
      expect(onChange).toHaveBeenLastCalledWith("+33 123456789");
      const form = screen.getByRole("form", {
        name: "Contact",
      }) as HTMLFormElement;
      expect(new FormData(form).get("telephone")).toBe(
        onChange.mock.lastCall?.[0]
      );
    });

    it("associates the submitted value with an external form", () => {
      render(
        <>
          <form id="contact" aria-label="Contact" />
          <TelephoneField
            {...defaultProps}
            defaultValue="2125550123"
            name="telephone"
            form="contact"
          />
        </>
      );

      const form = screen.getByRole("form", {
        name: "Contact",
      }) as HTMLFormElement;
      expect(new FormData(form).get("telephone")).toBe("+1 (212) 555-0123");
    });

    it("lets the application reset the controlled number and country together", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onCountryChange = vi.fn();
      const ResettableTelephone = () => {
        const [value, setValue] = useState("+1 (212) 555-0123");
        const [country, setCountry] = useState("US");

        return (
          <form aria-label="Contact">
            <TelephoneField
              {...defaultProps}
              name="telephone"
              value={value}
              country={country}
              onChange={(next) => {
                setValue(next);
                onChange(next);
              }}
              onCountryChange={(next) => {
                setCountry(next);
                onCountryChange(next);
              }}
            />
            <button
              type="button"
              onClick={() => {
                setValue("+1 (212) 555-0123");
                setCountry("US");
              }}
            >
              Reset telephone
            </button>
          </form>
        );
      };
      render(<ResettableTelephone />);
      const form = screen.getByRole("form", {
        name: "Contact",
      }) as HTMLFormElement;
      await user.click(getCountryTrigger());
      await user.click(screen.getByRole("option", { name: /France/ }));
      await user.clear(getInput());
      await user.type(getInput(), "987654321");
      expect(getInput()).toHaveValue("(9)87-65-43-21");
      expect(new FormData(form).get("telephone")).toBe(
        onChange.mock.lastCall?.[0]
      );
      onChange.mockClear();

      await user.click(screen.getByRole("button", { name: "Reset telephone" }));

      expect(getInput()).toHaveValue("(212) 555-0123");
      expect(getCountryTrigger()).toHaveTextContent(/^\+1$/);
      expect(new FormData(form).getAll("telephone")).toEqual([
        "+1 (212) 555-0123",
      ]);
      await user.click(getCountryTrigger());
      expect(
        screen.getByRole("option", { name: /United States/ })
      ).toHaveAttribute("aria-selected", "true");
      expect(onChange).not.toHaveBeenCalled();
      expect(onCountryChange).toHaveBeenCalledExactlyOnceWith("FR");
    });

    it("omits a disabled telephone from form submission", () => {
      render(
        <form aria-label="Contact">
          <TelephoneField
            {...defaultProps}
            defaultValue="2125550123"
            name="telephone"
            isDisabled
          />
        </form>
      );

      const form = screen.getByRole("form", {
        name: "Contact",
      }) as HTMLFormElement;
      expect(new FormData(form).has("telephone")).toBe(false);
    });
  });
});

describe("useTelephoneField", () => {
  it("formats an edit before the input ref is attached", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useTelephoneField({ onChange }));

    act(() => result.current.onChange("2125550123"));

    expect(result.current.inputValue).toBe("(212) 555-0123");
    expect(onChange).toHaveBeenCalledExactlyOnceWith("+1 (212) 555-0123");
  });

  it.each([null, 1, "ZZ", "GB", "US"])(
    "ignores an unavailable or unchanged country selection (%s)",
    (country) => {
      const onChange = vi.fn();
      const onCountryChange = vi.fn();
      const { result } = renderHook(() =>
        useTelephoneField({
          onlyCountries: ["US", "CA"],
          onChange,
          onCountryChange,
        })
      );

      act(() => result.current.onCountryChange(country));

      expect(result.current.country).toBe("US");
      expect(onChange).not.toHaveBeenCalled();
      expect(onCountryChange).not.toHaveBeenCalled();
    }
  );
});
