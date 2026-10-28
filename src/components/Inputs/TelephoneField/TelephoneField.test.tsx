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
  const [country, setCountry] = useState(props.defaultCountry ?? "US");

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

    it("separates the area code for other countries sharing +1", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <TelephoneField
          {...defaultProps}
          onlyCountries={["AG"]}
          defaultCountry="AG"
          onChange={onChange}
        />
      );

      await user.type(getInput(), "3643463463");

      expect(getInput()).toHaveValue("(364) 346-3463");
      expect(onChange).toHaveBeenLastCalledWith("+1 (364) 346-3463");
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

    it("groups Faroe Islands digits after the three-digit area code", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <TelephoneField
          {...defaultProps}
          onlyCountries={["US", "FO"]}
          onChange={onChange}
        />
      );

      await user.click(getCountryTrigger());
      await user.click(screen.getByRole("option", { name: /Faroe Islands/ }));
      expect(getInput()).toHaveAttribute("placeholder", "(000) 000");

      await user.type(getInput(), "242");
      expect(getInput()).toHaveValue("(242)");
      await user.type(getInput(), "5");
      expect(getInput()).toHaveValue("(242) 5");
      await user.type(getInput(), "67");
      expect(getInput()).toHaveValue("(242) 567");
      expect(onChange).toHaveBeenLastCalledWith("+298 (242) 567");

      await user.type(getInput(), "8");
      expect(getInput()).toHaveValue("(242) 567");
      expect(onChange).toHaveBeenLastCalledWith("+298 (242) 567");
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

    it.each([
      {
        country: "US",
        callingCode: "1",
        digits: "2125550123",
        boundary: ["212", "5", "(212)", "(212) 5"],
        display: [
          "(212) 555-0123",
          "212 555 0123",
          "212-555-0123",
          "2125550123",
          "21.25550123",
        ],
        placeholder: [
          "(000) 000-0000",
          "000 000 0000",
          "000-000-0000",
          "0000000000",
          "00.00000000",
        ],
      },
      {
        country: "GB",
        callingCode: "44",
        digits: "2079460958",
        boundary: ["2079", "4", "(2079)", "(2079) 4"],
        display: [
          "(2079) 460-958",
          "2079 460 958",
          "2079-460-958",
          "2079460958",
          "20.79460958",
        ],
        placeholder: [
          "(0000) 000-000",
          "0000 000 000",
          "0000-000-000",
          "0000000000",
          "00.00000000",
        ],
      },
      {
        country: "FR",
        callingCode: "33",
        digits: "123456789",
        boundary: ["1", "2", "(1)", "(1) 2"],
        display: [
          "(1) 23-45-67-89",
          "1 23 45 67 89",
          "1-23-45-67-89",
          "123456789",
          "12.3456789",
        ],
        placeholder: [
          "(0) 00-00-00-00",
          "0 00 00 00 00",
          "0-00-00-00-00",
          "000000000",
          "00.0000000",
        ],
      },
      {
        country: "FO",
        callingCode: "298",
        digits: "242567",
        boundary: ["242", "5", "(242)", "(242) 5"],
        display: ["(242) 567", "242 567", "242-567", "242567", "24.2567"],
        placeholder: ["(000) 000", "000 000", "000-000", "000000", "00.0000"],
      },
      {
        country: "AU",
        callingCode: "61",
        digits: "412345678",
        boundary: ["412", "3", "(412)", "(412) 3"],
        display: [
          "(412) 345-678",
          "412 345 678",
          "412-345-678",
          "412345678",
          "41.2345678",
        ],
        placeholder: [
          "(000) 000-000",
          "000 000 000",
          "000-000-000",
          "000000000",
          "00.0000000",
        ],
      },
      {
        country: "IN",
        callingCode: "91",
        digits: "9123456789",
        boundary: ["91234", "5", "(91234)", "(91234) 5"],
        display: [
          "(91234) 56789",
          "91234 56789",
          "91234-56789",
          "9123456789",
          "91.23456789",
        ],
        placeholder: [
          "(00000) 00000",
          "00000 00000",
          "00000-00000",
          "0000000000",
          "00.00000000",
        ],
      },
      {
        country: "BR",
        callingCode: "55",
        digits: "1123456789",
        boundary: ["11", "2", "(11)", "(11) 2"],
        display: [
          "(11) 2345-6789",
          "11 2345 6789",
          "11-2345-6789",
          "1123456789",
          "11.23456789",
        ],
        placeholder: [
          "(00) 00000-0000",
          "00 00000 0000",
          "00-00000-0000",
          "00000000000",
          "00.000000000",
        ],
      },
      {
        country: "BR",
        callingCode: "55",
        digits: "11912345678",
        boundary: ["11", "9", "(11)", "(11) 9"],
        display: [
          "(11) 91234-5678",
          "11 91234 5678",
          "11-91234-5678",
          "11912345678",
          "11.912345678",
        ],
        placeholder: [
          "(00) 00000-0000",
          "00 00000 0000",
          "00-00000-0000",
          "00000000000",
          "00.000000000",
        ],
      },
      {
        country: "JP",
        callingCode: "81",
        digits: "3123456789",
        boundary: ["31", "2", "(31)", "(31) 2"],
        display: [
          "(31) 2345-6789",
          "31 2345 6789",
          "31-2345-6789",
          "3123456789",
          "31.23456789",
        ],
        placeholder: [
          "(00) 0000-0000",
          "00 0000 0000",
          "00-0000-0000",
          "0000000000",
          "00.00000000",
        ],
      },
      {
        country: "CK",
        callingCode: "682",
        digits: "12345",
        boundary: ["123", "4", "(123)", "(123) 4"],
        display: ["(123) 45", "123 45", "123-45", "12345", "12.345"],
        placeholder: ["(000) 00", "000 00", "000-00", "00000", "00.000"],
      },
      {
        country: "SB",
        callingCode: "677",
        digits: "1234567",
        boundary: ["123", "4", "(123)", "(123) 4"],
        display: ["(123) 4567", "123 4567", "123-4567", "1234567", "12.34567"],
        placeholder: [
          "(000) 0000",
          "000 0000",
          "000-0000",
          "0000000",
          "00.00000",
        ],
      },
      {
        country: "DK",
        callingCode: "45",
        digits: "12345678",
        boundary: ["123", "4", "(123)", "(123) 4"],
        display: [
          "(123) 456-78",
          "123 456 78",
          "123-456-78",
          "12345678",
          "12.345678",
        ],
        placeholder: [
          "(000) 000-00",
          "000 000 00",
          "000-000-00",
          "00000000",
          "00.000000",
        ],
      },
      {
        country: "NZ",
        callingCode: "64",
        digits: "1234567890",
        boundary: ["123", "4", "(123)", "(123) 4"],
        display: [
          "(123) 456-7890",
          "123 456 7890",
          "123-456-7890",
          "1234567890",
          "12.34567890",
        ],
        placeholder: [
          "(000) 000-0000",
          "000 000 0000",
          "000-000-0000",
          "0000000000",
          "00.00000000",
        ],
      },
      {
        country: "RU",
        callingCode: "7",
        digits: "12345678901234",
        boundary: ["123", "4", "(123)", "(123) 4"],
        display: [
          "(123) 456-789-012-34",
          "123 456 789 012 34",
          "123-456-789-012-34",
          "12345678901234",
          "12.345678901234",
        ],
        placeholder: [
          "(000) 000-000-000-00",
          "000 000 000 000 00",
          "000-000-000-000-00",
          "00000000000000",
          "00.000000000000",
        ],
      },
    ])(
      "round-trips every format for $country national digits $digits",
      async ({
        country,
        callingCode,
        digits,
        boundary,
        display,
        placeholder,
      }) => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        const props = {
          defaultCountry: country,
          onlyCountries: [country],
          onChange,
        };
        const { rerender } = render(<ControlledTelephone {...props} />);

        await user.type(getInput(), boundary[0]);
        expect(getInput()).toHaveValue(boundary[2]);
        await user.type(getInput(), boundary[1]);
        expect(getInput()).toHaveValue(boundary[3]);

        const formats = [
          { format: "parentheses" },
          { format: "spaces" },
          { format: "dashes" },
          { format: "digits" },
          { format: "dashes", mask: "##.##" },
        ] as const;
        for (const [index, formatting] of formats.entries()) {
          rerender(<ControlledTelephone {...props} {...formatting} />);
          await user.clear(getInput());
          onChange.mockClear();

          expect(getInput()).toHaveAttribute("placeholder", placeholder[index]);
          await user.paste(digits);

          expect(getInput()).toHaveValue(display[index]);
          expect(onChange).toHaveBeenCalledExactlyOnceWith(
            `+${callingCode} ${display[index]}`
          );
        }
      }
    );

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

  describe("placeholder", () => {
    it.each([
      ["United Kingdom", "(0000) 000-000"],
      ["France", "(0) 00-00-00-00"],
      ["Solomon Islands", "(000) 0000"],
    ])(
      "updates the empty input hint when selecting %s",
      async (country, placeholder) => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<TelephoneField {...defaultProps} onChange={onChange} />);

        expect(getInput()).toHaveAttribute("placeholder", "(000) 000-0000");
        await user.click(getCountryTrigger());
        await user.click(
          screen.getByRole("option", { name: new RegExp(country) })
        );

        expect(getInput()).toHaveAttribute("placeholder", placeholder);
        expect(getInput()).toHaveValue("");
        expect(onChange).toHaveBeenCalledExactlyOnceWith("");
      }
    );

    it("follows a controlled country when its owner accepts the selection", async () => {
      const user = userEvent.setup();
      render(<ControlledTelephone />);

      await user.click(getCountryTrigger());
      await user.click(screen.getByRole("option", { name: /United Kingdom/ }));

      expect(getCountryTrigger()).toHaveTextContent(/^\+44$/);
      expect(getInput()).toHaveAttribute("placeholder", "(0000) 000-000");
      expect(getInput()).toHaveValue("");
    });

    it("keeps the hint for a controlled country until its owner accepts the change", async () => {
      const user = userEvent.setup();
      const onCountryChange = vi.fn();
      const props = { ...defaultProps, value: "", onCountryChange };
      const { rerender } = render(<TelephoneField {...props} country="US" />);

      await user.click(getCountryTrigger());
      await user.click(screen.getByRole("option", { name: /United Kingdom/ }));

      expect(onCountryChange).toHaveBeenCalledExactlyOnceWith("GB");
      expect(getCountryTrigger()).toHaveTextContent(/^\+1$/);
      expect(getInput()).toHaveAttribute("placeholder", "(000) 000-0000");

      rerender(<TelephoneField {...props} country="GB" />);

      expect(getInput()).toHaveAttribute("placeholder", "(0000) 000-000");
      expect(getInput()).toHaveValue("");
      expect(onCountryChange).toHaveBeenCalledTimes(1);
    });

    it("updates when the format or custom mask changes", () => {
      const { rerender } = render(<TelephoneField {...defaultProps} />);

      for (const [format, placeholder] of [
        ["spaces", "000 000 0000"],
        ["dashes", "000-000-0000"],
        ["digits", "0000000000"],
      ] as const) {
        rerender(<TelephoneField {...defaultProps} format={format} />);
        expect(getInput()).toHaveAttribute("placeholder", placeholder);
      }

      rerender(
        <TelephoneField {...defaultProps} format="digits" mask="###.###.####" />
      );
      expect(getInput()).toHaveAttribute("placeholder", "000.000.0000");

      rerender(
        <TelephoneField {...defaultProps} format="digits" mask="##.##" />
      );
      expect(getInput()).toHaveAttribute("placeholder", "00.00000000");

      rerender(<TelephoneField {...defaultProps} format="digits" mask="" />);
      expect(getInput()).toHaveAttribute("placeholder", "0000000000");
      expect(getInput()).toHaveValue("");
    });

    it.each(["Enter a number", ""])(
      "preserves the explicit placeholder %j after a country selection",
      async (placeholder) => {
        const user = userEvent.setup();
        render(<TelephoneField {...defaultProps} placeholder={placeholder} />);

        expect(getInput()).toHaveAttribute("placeholder", placeholder);
        await user.click(getCountryTrigger());
        await user.click(
          screen.getByRole("option", { name: /United Kingdom/ })
        );

        expect(getCountryTrigger()).toHaveTextContent(/^\+44$/);
        expect(getInput()).toHaveAttribute("placeholder", placeholder);
      }
    );

    it.each([
      { scenario: "ambiguous", props: { defaultValue: "+442079460958" } },
      { scenario: "unsupported", props: { country: "XX" } },
      {
        scenario: "excluded",
        props: { country: "US", excludeCountries: ["US"] },
      },
      {
        scenario: "outside the allowed list",
        props: { country: "GB", onlyCountries: ["US"] },
      },
    ])("does not guess a hint when the country is $scenario", ({ props }) => {
      const { rerender } = render(
        <TelephoneField {...defaultProps} {...props} />
      );

      expect(getInput()).not.toHaveAttribute("placeholder");

      rerender(
        <TelephoneField {...defaultProps} {...props} mask="###.###.####" />
      );

      expect(getInput()).not.toHaveAttribute("placeholder");
    });
  });

  describe("country selection", () => {
    it("does not offer territories without flags even when explicitly included", async () => {
      const user = userEvent.setup();
      render(
        <TelephoneField
          {...defaultProps}
          defaultCountry="SH"
          onlyCountries={["AC", "TA", "SH"]}
        />
      );

      await user.click(getCountryTrigger());

      expect(screen.getAllByRole("option")).toHaveLength(1);
      const option = screen.getByRole("option", { name: /Helena/ });
      expect(option).toHaveTextContent("+290");
      expect(option.querySelector("img")).toHaveAttribute(
        "src",
        "https://cdn.jsdelivr.net/npm/flag-icons@7.6.0/flags/4x3/sh.svg"
      );
      expect(
        screen.queryByRole("option", { name: /Ascension|Tristan/ })
      ).toBeNull();
    });

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

  describe("fixed numeric masks", () => {
    it.each(["+55 1187654321", "+55 11987654321", "+55 (11) 98765-4321"])(
      "accepts %s and keeps the emitted value stable through controlled edits",
      async (value) => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
          <ControlledTelephone
            defaultCountry="BR"
            defaultValue={value}
            mask="(##) 9####-####"
            onChange={onChange}
          />
        );

        expect(getInput()).toHaveValue("(11) 98765-4321");
        await user.type(getInput(), "{End}{Backspace}2");

        expect(getInput()).toHaveValue("(11) 98765-4322");
        expect(onChange).toHaveBeenLastCalledWith("+55 (11) 98765-4322");
        expect(onChange).toHaveBeenCalledTimes(2);
      }
    );

    it("validates and submits the same full number including fixed digits", async () => {
      const user = userEvent.setup();
      const submit = vi.fn();
      const validate = vi.fn((value: string) =>
        value === "+55 (11) 98765-4321" ? null : "Enter the example number."
      );
      render(
        <form
          aria-label="Contact"
          onSubmit={(event) => {
            event.preventDefault();
            submit(new FormData(event.currentTarget).getAll("telephone"));
          }}
        >
          <TelephoneField
            label="Telephone"
            onlyCountries={["BR"]}
            defaultCountry="BR"
            mask="(##) 9####-####"
            name="telephone"
            isRequired
            validate={validate}
            errorMessage={({ validationErrors }) => validationErrors.join(" ")}
          />
          <button type="submit">Save</button>
        </form>
      );

      await user.type(getInput(), "1187");
      await user.click(screen.getByRole("button", { name: "Save" }));
      expect(getInput()).toBeInvalid();
      expect(submit).not.toHaveBeenCalled();
      await user.click(getInput());
      await user.keyboard("{End}654321");
      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(getInput()).toHaveValue("(11) 98765-4321");
      expect(getInput()).toBeValid();
      expect(validate).toHaveBeenLastCalledWith("+55 (11) 98765-4321");
      expect(submit).toHaveBeenCalledExactlyOnceWith(["+55 (11) 98765-4321"]);
    });

    it("counts fixed digits when a country change shortens the number", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <TelephoneField
          label="Telephone"
          onlyCountries={["US", "FO"]}
          defaultValue="1234567890"
          mask="0##########"
          onChange={onChange}
        />
      );

      await user.click(getCountryTrigger());
      await user.click(screen.getByRole("option", { name: /Faroe Islands/ }));

      expect(getInput()).toHaveValue("012345");
      expect(onChange).toHaveBeenCalledExactlyOnceWith("+298 012345");
      await user.click(getCountryTrigger());
      await user.click(screen.getByRole("option", { name: /United States/ }));
      expect(getInput()).toHaveValue("012345");
      expect(onChange).toHaveBeenLastCalledWith("+1 012345");
    });
  });

  describe("validation", () => {
    it.each([
      ["parentheses", "(212) 555-0123", undefined],
      ["spaces", "212 555 0123", undefined],
      ["dashes", "212-555-0123", undefined],
      ["digits", "2125550123", undefined],
      ["digits", "212.555.0123", "###.###.####"],
    ] as const)(
      "rejects incomplete %s input and submits %s with mask %j",
      async (format, nationalValue, mask) => {
        const user = userEvent.setup();
        const submit = vi.fn();
        const validate = vi.fn((value: string) =>
          value.replace(/\D/g, "").length === 11
            ? null
            : "Enter ten national digits."
        );
        render(
          <form
            aria-label="Contact"
            onSubmit={(event) => {
              event.preventDefault();
              submit(new FormData(event.currentTarget).getAll("telephone"));
            }}
          >
            <TelephoneField
              {...defaultProps}
              name="telephone"
              format={format}
              mask={mask}
              isRequired
              validate={validate}
              errorMessage={({ validationErrors }) =>
                validationErrors.join(" ")
              }
            />
            <button type="submit">Save</button>
          </form>
        );

        await user.type(getInput(), "212");
        await user.click(screen.getByRole("button", { name: "Save" }));

        expect(submit).not.toHaveBeenCalled();
        expect(getInput()).toBeInvalid();
        expect(getInput()).toHaveAccessibleDescription(
          "Enter ten national digits."
        );

        await user.type(getInput(), "5550123");
        await user.click(screen.getByRole("button", { name: "Save" }));

        expect(validate).toHaveBeenLastCalledWith(`+1 ${nationalValue}`);
        expect(getInput()).toBeValid();
        expect(submit).toHaveBeenCalledExactlyOnceWith([`+1 ${nationalValue}`]);
        expect(screen.queryByText("Enter ten national digits.")).toBeNull();
      }
    );

    it("renders all custom validation errors and recovers when the validator changes", async () => {
      const user = userEvent.setup();
      const props = {
        ...defaultProps,
        defaultValue: "2125550123",
        validationBehavior: "aria" as const,
        errorMessage: ({ validationErrors }: { validationErrors: string[] }) =>
          validationErrors.join(" "),
      };
      const { rerender } = render(
        <TelephoneField
          {...props}
          validate={() => ["Number blocked.", "Try a different number."]}
        />
      );

      await user.click(getInput());
      await user.tab();
      expect(getInput()).toBeInvalid();
      expect(getInput()).toHaveAccessibleDescription(
        "Number blocked. Try a different number."
      );

      rerender(<TelephoneField {...props} validate={() => null} />);
      await user.click(getInput());
      await user.tab();

      expect(getInput()).toBeValid();
      expect(
        screen.queryByText("Number blocked. Try a different number.")
      ).toBeNull();
    });

    it("validates again after a country change and submits the new calling code", async () => {
      const user = userEvent.setup();
      const submit = vi.fn();
      const validate = vi.fn((value: string) =>
        value.startsWith("+33 ") ? null : "Choose the French number."
      );
      render(
        <form
          aria-label="Contact"
          onSubmit={(event) => {
            event.preventDefault();
            submit(new FormData(event.currentTarget).getAll("telephone"));
          }}
        >
          <TelephoneField
            {...defaultProps}
            name="telephone"
            defaultValue="2125550123"
            validate={validate}
            errorMessage={({ validationErrors }) => validationErrors.join(" ")}
          />
          <button type="submit">Save</button>
        </form>
      );

      await user.click(screen.getByRole("button", { name: "Save" }));
      expect(getInput()).toBeInvalid();
      expect(getInput()).toHaveAccessibleDescription(
        "Choose the French number."
      );
      expect(submit).not.toHaveBeenCalled();

      await user.click(getCountryTrigger());
      await user.click(screen.getByRole("option", { name: /France/ }));
      expect(getInput()).toBeValid();
      expect(screen.queryByText("Choose the French number.")).toBeNull();
      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(validate).toHaveBeenLastCalledWith("+33 (2) 12-55-50-12");
      expect(getInput()).toBeValid();
      expect(submit).toHaveBeenCalledExactlyOnceWith(["+33 (2) 12-55-50-12"]);
      const form = screen.getByRole("form", {
        name: "Contact",
      }) as HTMLFormElement;
      expect(new FormData(form).getAll("telephone")).toEqual([
        "+33 (2) 12-55-50-12",
      ]);
    });

    it("validates native patterns against the displayed national format", async () => {
      const user = userEvent.setup();
      render(
        <form aria-label="Contact">
          <TelephoneField
            {...defaultProps}
            name="telephone"
            format="digits"
            pattern="[0-9]{10}"
            isRequired
          />
        </form>
      );
      const form = screen.getByRole("form", {
        name: "Contact",
      }) as HTMLFormElement;

      await user.type(getInput(), "212");
      act(() => {
        expect(form.checkValidity()).toBe(false);
      });
      expect(getInput()).toHaveProperty("validity.patternMismatch", true);

      await user.type(getInput(), "5550123");
      expect(form.checkValidity()).toBe(true);
      expect(new FormData(form).getAll("telephone")).toEqual(["+1 2125550123"]);
    });

    it("keeps aria validation advisory and exposes the error accessibly", async () => {
      const user = userEvent.setup();
      render(
        <form aria-label="Contact">
          <TelephoneField
            {...defaultProps}
            name="telephone"
            validationBehavior="aria"
            isRequired
            validate={() => "Check this number."}
            errorMessage={({ validationErrors }) => validationErrors.join(" ")}
          />
        </form>
      );

      await user.type(getInput(), "212");

      expect(getInput()).toHaveAttribute("aria-invalid", "true");
      expect(getInput()).toHaveAttribute("aria-required", "true");
      expect(getInput()).toHaveAccessibleDescription("Check this number.");
      const form = screen.getByRole("form", {
        name: "Contact",
      }) as HTMLFormElement;
      expect(form.checkValidity()).toBe(true);
    });

    it("does not reject incomplete optional numbers without a consumer validator", async () => {
      const user = userEvent.setup();
      render(<TelephoneField {...defaultProps} />);

      await user.type(getInput(), "212");
      await user.tab();

      expect(getInput()).toBeValid();
      await user.clear(getInput());
      expect(getInput()).toBeValid();
    });

    it("keeps a required field empty when only its country is changed", async () => {
      const user = userEvent.setup();
      const submit = vi.fn();
      render(
        <form
          aria-label="Contact"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <TelephoneField
            {...defaultProps}
            name="telephone"
            isRequired
            errorMessage="Enter a telephone number."
          />
          <button type="submit">Save</button>
        </form>
      );

      await user.click(getCountryTrigger());
      await user.click(screen.getByRole("option", { name: /France/ }));
      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(getInput()).toHaveValue("");
      expect(getInput()).toBeInvalid();
      expect(getInput()).toHaveAccessibleDescription(
        "Enter a telephone number."
      );
      expect(submit).not.toHaveBeenCalled();
    });

    it("validates the accepted controlled value after the owner declines an edit", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const validate = vi.fn((value: string) =>
        value === "+1 (212) 555-0123" ? null : "Unexpected number."
      );
      render(
        <TelephoneField
          {...defaultProps}
          country="US"
          value="+12125550123"
          onChange={onChange}
          validate={validate}
          validationBehavior="aria"
          errorMessage={({ validationErrors }) => validationErrors.join(" ")}
        />
      );

      await user.clear(getInput());

      expect(onChange).toHaveBeenCalledExactlyOnceWith("");
      expect(getInput()).toHaveValue("(212) 555-0123");
      expect(validate).toHaveBeenLastCalledWith("+1 (212) 555-0123");
      expect(getInput()).toBeValid();
      expect(screen.queryByText("Unexpected number.")).toBeNull();
    });

    it.each(["isDisabled", "isReadOnly"] as const)(
      "skips native constraints when %s and retains the expected submitted value",
      async (state) => {
        const user = userEvent.setup();
        const submit = vi.fn();
        render(
          <form
            aria-label="Contact"
            onSubmit={(event) => {
              event.preventDefault();
              submit(new FormData(event.currentTarget).getAll("telephone"));
            }}
          >
            <TelephoneField
              {...defaultProps}
              name="telephone"
              defaultValue="212"
              isRequired
              pattern="[0-9]{10}"
              validate={() => "Number rejected."}
              {...{ [state]: true }}
            />
            <button type="submit">Save</button>
          </form>
        );

        await user.click(screen.getByRole("button", { name: "Save" }));

        expect(getInput()).toHaveProperty("willValidate", false);
        expect(submit).toHaveBeenCalledExactlyOnceWith(
          state === "isDisabled" ? [] : ["+1 (212)"]
        );
      }
    );

    it("clears a server error after editing and preserves the full number for submission", async () => {
      const user = userEvent.setup();
      const submit = vi.fn();
      render(
        <Form
          aria-label="Contact"
          validationErrors={{ telephone: "Number already in use." }}
          onSubmit={(event) => {
            event.preventDefault();
            submit(new FormData(event.currentTarget).getAll("telephone"));
          }}
        >
          <TelephoneField
            {...defaultProps}
            name="telephone"
            defaultValue="2125550123"
            errorMessage={({ validationErrors }) => validationErrors.join(" ")}
          />
          <button type="submit">Save</button>
        </Form>
      );

      expect(getInput()).toHaveAccessibleDescription("Number already in use.");
      await user.type(getInput(), "{End}{Backspace}4");
      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(getInput()).toBeValid();
      expect(screen.queryByText("Number already in use.")).toBeNull();
      expect(submit).toHaveBeenCalledExactlyOnceWith(["+1 (212) 555-0124"]);
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
      expect(getInput()).toHaveValue("(9) 87-65-43-21");
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
