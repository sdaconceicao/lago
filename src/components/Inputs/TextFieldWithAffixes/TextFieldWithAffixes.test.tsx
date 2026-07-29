import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FieldButton } from "@/components/Inputs/FormComponents/index";
import { SelectItem } from "@/components/Inputs/Select/Select";
import { AffixSelect } from "./BaseComponents/AffixSelect";
import { TextFieldWithAffixes } from "./TextFieldWithAffixes";

describe("TextFieldWithAffixes", () => {
  it("renders an input with an accessible label", () => {
    render(<TextFieldWithAffixes label="Website" />);

    expect(
      screen.getByRole("textbox", { name: "Website" })
    ).toBeInTheDocument();
  });

  it("renders the placeholder", () => {
    render(<TextFieldWithAffixes label="Website" placeholder="example" />);

    expect(screen.getByPlaceholderText("example")).toBeInTheDocument();
  });

  it("supports an uncontrolled default value", () => {
    render(<TextFieldWithAffixes label="Website" defaultValue="lago" />);

    expect(screen.getByRole("textbox")).toHaveValue("lago");
  });

  it("associates the description with the input", () => {
    render(
      <TextFieldWithAffixes label="Website" description="No scheme needed" />
    );

    expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
      "No scheme needed"
    );
  });

  it("shows the error message when invalid", () => {
    render(
      <TextFieldWithAffixes
        label="Website"
        isInvalid
        errorMessage="Invalid domain"
      />
    );

    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Invalid domain")).toBeInTheDocument();
  });

  it("does not render the error message when valid", () => {
    render(
      <TextFieldWithAffixes label="Website" errorMessage="Invalid domain" />
    );

    expect(screen.queryByText("Invalid domain")).not.toBeInTheDocument();
  });

  it("disables the input when isDisabled", () => {
    render(<TextFieldWithAffixes label="Website" isDisabled />);

    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("forwards inputRef to the input element", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<TextFieldWithAffixes label="Website" inputRef={ref} />);

    expect(ref.current).toBe(screen.getByRole("textbox"));
  });

  describe("size", () => {
    it('renders data-field-size="md" by default', () => {
      const { container } = render(<TextFieldWithAffixes label="Website" />);

      expect(container.querySelector("[data-field-size]")).toHaveAttribute(
        "data-field-size",
        "md"
      );
    });

    it('renders data-field-size="sm" when specified', () => {
      const { container } = render(
        <TextFieldWithAffixes label="Website" size="sm" />
      );

      expect(container.querySelector("[data-field-size]")).toHaveAttribute(
        "data-field-size",
        "sm"
      );
    });

    it('renders data-field-size="lg" when specified', () => {
      const { container } = render(
        <TextFieldWithAffixes label="Website" size="lg" />
      );

      expect(container.querySelector("[data-field-size]")).toHaveAttribute(
        "data-field-size",
        "lg"
      );
    });

    it("does not forward size to the DOM input", () => {
      render(<TextFieldWithAffixes label="Website" size="sm" />);

      expect(screen.getByRole("textbox")).not.toHaveAttribute("size");
    });
  });

  describe("static affixes", () => {
    it("renders neither segment when no affix is passed", () => {
      const { container } = render(<TextFieldWithAffixes label="Website" />);

      expect(container.querySelectorAll("[class*='affix']")).toHaveLength(0);
    });

    it("renders a static prefix", () => {
      render(<TextFieldWithAffixes label="Website" prefix="https://" />);

      expect(screen.getByText("https://")).toBeInTheDocument();
    });

    it("renders a static suffix", () => {
      render(<TextFieldWithAffixes label="Website" suffix=".com" />);

      expect(screen.getByText(".com")).toBeInTheDocument();
    });

    it("renders a prefix and a suffix together", () => {
      render(
        <TextFieldWithAffixes label="Website" prefix="https://" suffix=".com" />
      );

      expect(screen.getByText("https://")).toBeInTheDocument();
      expect(screen.getByText(".com")).toBeInTheDocument();
    });

    it("renders arbitrary nodes as an affix", () => {
      render(
        <TextFieldWithAffixes
          label="Amount"
          prefix={<span data-testid="currency">USD</span>}
        />
      );

      expect(screen.getByTestId("currency")).toBeInTheDocument();
    });

    it("orders the prefix before the input and the suffix after it", () => {
      render(
        <TextFieldWithAffixes label="Website" prefix="https://" suffix=".com" />
      );

      const input = screen.getByRole("textbox");
      const prefix = screen.getByText("https://");
      const suffix = screen.getByText(".com");

      expect(
        prefix.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
      expect(
        input.compareDocumentPosition(suffix) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });

    it("keeps the affixes outside the input so they are not typed over", async () => {
      const user = userEvent.setup();
      render(
        <TextFieldWithAffixes label="Website" prefix="https://" suffix=".com" />
      );

      await user.type(screen.getByRole("textbox"), "lago");

      expect(screen.getByRole("textbox")).toHaveValue("lago");
    });
  });

  describe("onChange", () => {
    it("reports the input's text as the user types", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<TextFieldWithAffixes label="Website" onChange={onChange} />);

      await user.type(screen.getByRole("textbox"), "abc");

      expect(onChange).toHaveBeenCalledTimes(3);
      expect(onChange).toHaveBeenLastCalledWith({ value: "abc" });
    });

    it("omits static affixes from the payload, having no value to select", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <TextFieldWithAffixes
          label="Website"
          prefix="https://"
          suffix=".com"
          onChange={onChange}
        />
      );

      await user.type(screen.getByRole("textbox"), "a");

      expect(onChange).toHaveBeenLastCalledWith({ value: "a" });
    });

    it("does not fire while the affixes report the selections they mounted with", () => {
      const onChange = vi.fn();
      render(
        <TextFieldWithAffixes
          label="Website"
          onChange={onChange}
          prefix={
            <AffixSelect aria-label="Scheme" defaultSelectedKey="https">
              <SelectItem id="https">https://</SelectItem>
            </AffixSelect>
          }
        />
      );

      expect(onChange).not.toHaveBeenCalled();
    });

    it("includes a dropdown affix's starting selection when the input changes", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <TextFieldWithAffixes
          label="Website"
          onChange={onChange}
          prefix={
            <AffixSelect aria-label="Scheme" defaultSelectedKey="https">
              <SelectItem id="https">https://</SelectItem>
              <SelectItem id="http">http://</SelectItem>
            </AffixSelect>
          }
        />
      );

      await user.type(screen.getByRole("textbox"), "a");

      expect(onChange).toHaveBeenLastCalledWith({
        value: "a",
        prefix: "https",
      });
    });

    it("fires when the prefix dropdown selection changes", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <TextFieldWithAffixes
          label="Website"
          defaultValue="lago"
          onChange={onChange}
          prefix={
            <AffixSelect aria-label="Scheme" defaultSelectedKey="https">
              <SelectItem id="https">https://</SelectItem>
              <SelectItem id="http">http://</SelectItem>
            </AffixSelect>
          }
        />
      );

      await user.click(screen.getByRole("button", { name: /Scheme/ }));
      await user.click(screen.getByRole("option", { name: "http://" }));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith({
        value: "lago",
        prefix: "http",
      });
    });

    it("fires when the suffix dropdown selection changes", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <TextFieldWithAffixes
          label="Amount"
          defaultValue="10"
          onChange={onChange}
          prefix="$"
          suffix={
            <AffixSelect aria-label="Currency" defaultSelectedKey="usd">
              <SelectItem id="usd">USD</SelectItem>
              <SelectItem id="eur">EUR</SelectItem>
            </AffixSelect>
          }
        />
      );

      await user.click(screen.getByRole("button", { name: /Currency/ }));
      await user.click(screen.getByRole("option", { name: "EUR" }));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith({
        value: "10",
        suffix: "eur",
      });
    });

    it("reports both affix selections alongside the text", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <TextFieldWithAffixes
          label="Measure"
          onChange={onChange}
          prefix={
            <AffixSelect aria-label="Measure" defaultSelectedKey="weight">
              <SelectItem id="weight">Weight</SelectItem>
              <SelectItem id="volume">Volume</SelectItem>
            </AffixSelect>
          }
          suffix={
            <AffixSelect aria-label="Unit" defaultSelectedKey="kg">
              <SelectItem id="kg">kg</SelectItem>
              <SelectItem id="lb">lb</SelectItem>
            </AffixSelect>
          }
        />
      );

      await user.type(screen.getByRole("textbox"), "5");
      await user.click(screen.getByRole("button", { name: /Unit/ }));
      await user.click(screen.getByRole("option", { name: "lb" }));

      expect(onChange).toHaveBeenLastCalledWith({
        value: "5",
        prefix: "weight",
        suffix: "lb",
      });
    });

    it("keeps reporting the latest text after an affix changes", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <TextFieldWithAffixes
          label="Website"
          onChange={onChange}
          suffix={
            <AffixSelect aria-label="TLD" defaultSelectedKey="com">
              <SelectItem id="com">.com</SelectItem>
              <SelectItem id="dev">.dev</SelectItem>
            </AffixSelect>
          }
        />
      );

      await user.click(screen.getByRole("button", { name: /TLD/ }));
      await user.click(screen.getByRole("option", { name: ".dev" }));
      await user.type(screen.getByRole("textbox"), "lago");

      expect(onChange).toHaveBeenLastCalledWith({
        value: "lago",
        suffix: "dev",
      });
    });

    it("still calls the affix's own onSelectionChange", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onSelectionChange = vi.fn();
      render(
        <TextFieldWithAffixes
          label="Website"
          onChange={onChange}
          prefix={
            <AffixSelect
              aria-label="Scheme"
              defaultSelectedKey="https"
              onSelectionChange={onSelectionChange}
            >
              <SelectItem id="https">https://</SelectItem>
              <SelectItem id="http">http://</SelectItem>
            </AffixSelect>
          }
        />
      );

      await user.click(screen.getByRole("button", { name: /Scheme/ }));
      await user.click(screen.getByRole("option", { name: "http://" }));

      expect(onSelectionChange).toHaveBeenCalledWith("http");
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("reports a controlled text value alongside an affix change", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <TextFieldWithAffixes
          label="Website"
          value="lago"
          onChange={onChange}
          suffix={
            <AffixSelect aria-label="TLD" defaultSelectedKey="com">
              <SelectItem id="com">.com</SelectItem>
              <SelectItem id="dev">.dev</SelectItem>
            </AffixSelect>
          }
        />
      );

      await user.click(screen.getByRole("button", { name: /TLD/ }));
      await user.click(screen.getByRole("option", { name: ".dev" }));

      expect(onChange).toHaveBeenLastCalledWith({
        value: "lago",
        suffix: "dev",
      });
    });
  });

  describe("with a trailing button", () => {
    it("renders the button alongside the input and the affixes", () => {
      render(
        <TextFieldWithAffixes
          label="Website"
          prefix="https://"
          button={<FieldButton aria-label="Clear">x</FieldButton>}
        />
      );

      expect(
        screen.getByRole("textbox", { name: "Website" })
      ).toBeInTheDocument();
      expect(screen.getByText("https://")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
    });

    it("presses the trailing button", async () => {
      const user = userEvent.setup();
      const onPress = vi.fn();
      render(
        <TextFieldWithAffixes
          label="Website"
          button={
            <FieldButton aria-label="Clear" onPress={onPress}>
              x
            </FieldButton>
          }
        />
      );

      await user.click(screen.getByRole("button", { name: "Clear" }));

      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe("with a dropdown affix", () => {
    const renderWithDropdown = (props = {}) =>
      render(
        <TextFieldWithAffixes
          label="Website"
          suffix=".com"
          prefix={
            <AffixSelect
              aria-label="Scheme"
              defaultSelectedKey="https"
              {...props}
            >
              <SelectItem id="https">https://</SelectItem>
              <SelectItem id="http">http://</SelectItem>
            </AffixSelect>
          }
        />
      );

    it("renders the dropdown trigger with its selected value", () => {
      renderWithDropdown();

      expect(screen.getByRole("button", { name: /Scheme/ })).toHaveTextContent(
        "https://"
      );
    });

    it("opens the dropdown and lists the options", async () => {
      const user = userEvent.setup();
      renderWithDropdown();

      await user.click(screen.getByRole("button", { name: /Scheme/ }));

      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(screen.getAllByRole("option")).toHaveLength(2);
    });

    it("updates the trigger when an option is picked", async () => {
      const user = userEvent.setup();
      renderWithDropdown();

      await user.click(screen.getByRole("button", { name: /Scheme/ }));
      await user.click(screen.getByRole("option", { name: "http://" }));

      expect(screen.getByRole("button", { name: /Scheme/ })).toHaveTextContent(
        "http://"
      );
    });

    it("scopes the portaled dropdown to the field's size", async () => {
      const user = userEvent.setup();
      render(
        <TextFieldWithAffixes
          label="Website"
          size="lg"
          prefix={
            <AffixSelect aria-label="Scheme" defaultSelectedKey="https">
              <SelectItem id="https">https://</SelectItem>
            </AffixSelect>
          }
        />
      );

      await user.click(screen.getByRole("button", { name: /Scheme/ }));

      expect(
        screen.getByRole("listbox").closest("[data-field-size]")
      ).toHaveAttribute("data-field-size", "lg");
    });

    it("works as a suffix as well as a prefix", async () => {
      const user = userEvent.setup();
      render(
        <TextFieldWithAffixes
          label="Weight"
          prefix="Net"
          suffix={
            <AffixSelect aria-label="Unit" defaultSelectedKey="kg">
              <SelectItem id="kg">kg</SelectItem>
              <SelectItem id="lb">lb</SelectItem>
            </AffixSelect>
          }
        />
      );

      await user.click(screen.getByRole("button", { name: /Unit/ }));

      expect(screen.getAllByRole("option")).toHaveLength(2);
    });

    it("leaves the input editable while a dropdown affix is present", async () => {
      const user = userEvent.setup();
      renderWithDropdown();

      await user.type(screen.getByRole("textbox"), "lago");

      expect(screen.getByRole("textbox")).toHaveValue("lago");
    });

    it("defaults to the md dropdown size when used outside a field", async () => {
      const user = userEvent.setup();
      render(
        <AffixSelect aria-label="Scheme" defaultSelectedKey="https">
          <SelectItem id="https">https://</SelectItem>
        </AffixSelect>
      );

      await user.click(screen.getByRole("button", { name: /Scheme/ }));

      expect(
        screen.getByRole("listbox").closest("[data-field-size]")
      ).toHaveAttribute("data-field-size", "md");
    });
  });
});
