import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { CreditCardNumber } from "./CreditCardNumber";
import { CARD_BRAND_LOGOS } from "./CreditCardNumber.logos";
import { CARD_BRANDS } from "./CreditCardNumber.utils";

const getInput = () => screen.getByRole("textbox", { name: "Card number" });

/** Controlled wrapper: the field owns the mask, the consumer owns the value. */
const ControlledCard = ({
  onChange,
}: {
  onChange?: (value: string) => void;
}) => {
  const [value, setValue] = useState("");

  return (
    <CreditCardNumber
      label="Card number"
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
};

describe("CreditCardNumber", () => {
  it("renders an input with an accessible label", () => {
    render(<CreditCardNumber label="Card number" />);

    expect(getInput()).toBeInTheDocument();
  });

  it("renders the input attributes a card number needs", () => {
    render(<CreditCardNumber label="Card number" />);

    const input = getInput();

    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).toHaveAttribute("autocomplete", "cc-number");
    expect(input).toHaveAttribute("autocorrect", "off");
    expect(input).toHaveAttribute("spellcheck", "false");
  });

  it("lets the consumer override autoComplete", () => {
    render(<CreditCardNumber label="Card number" autoComplete="off" />);

    expect(getInput()).toHaveAttribute("autocomplete", "off");
  });

  describe("masking", () => {
    it("groups digits in fours as the user types", async () => {
      const user = userEvent.setup();
      render(<CreditCardNumber label="Card number" />);

      await user.type(getInput(), "4242424242");

      expect(getInput()).toHaveValue("4242 4242 42");
    });

    it("groups an American Express number as 4-6-5", async () => {
      const user = userEvent.setup();
      render(<CreditCardNumber label="Card number" />);

      await user.type(getInput(), "378282246310005");

      expect(getInput()).toHaveValue("3782 822463 10005");
    });

    it("regroups digits already entered when the brand is recognised", async () => {
      const user = userEvent.setup();
      render(<CreditCardNumber label="Card number" />);

      await user.type(getInput(), "372828224631000");

      expect(getInput()).toHaveValue("3728 282246 31000");
    });

    it("ignores characters that are not digits", async () => {
      const user = userEvent.setup();
      render(<CreditCardNumber label="Card number" />);

      await user.type(getInput(), "4a2b4c2-4/2 4 2");

      expect(getInput()).toHaveValue("4242 4242");
    });

    it("stops at the longest number the brand issues", async () => {
      const user = userEvent.setup();
      render(<CreditCardNumber label="Card number" />);

      await user.type(getInput(), "3782822463100051234");

      expect(getInput()).toHaveValue("3782 822463 10005");
    });

    it("caps the input length at the masked length of the brand", async () => {
      const user = userEvent.setup();
      render(<CreditCardNumber label="Card number" />);

      expect(getInput()).toHaveAttribute("maxlength", "23");

      await user.type(getInput(), "3782");

      expect(getInput()).toHaveAttribute("maxlength", "17");
    });

    it("masks an uncontrolled default value", () => {
      render(
        <CreditCardNumber label="Card number" defaultValue="378282246310005" />
      );

      expect(getInput()).toHaveValue("3782 822463 10005");
    });

    it("masks a controlled value", () => {
      render(<CreditCardNumber label="Card number" value="4242424242424242" />);

      expect(getInput()).toHaveValue("4242 4242 4242 4242");
    });

    it("masks a controlled value the consumer feeds back", async () => {
      const user = userEvent.setup();
      render(<ControlledCard />);

      await user.type(getInput(), "5555555555554444");

      expect(getInput()).toHaveValue("5555 5555 5555 4444");
    });

    it("reports the masked value to onChange", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<CreditCardNumber label="Card number" onChange={onChange} />);

      await user.type(getInput(), "42424");

      expect(onChange).toHaveBeenLastCalledWith("4242 4");
    });
  });

  describe("caret handling", () => {
    it("keeps the caret with the digit it was typed after", async () => {
      const user = userEvent.setup();
      render(<CreditCardNumber label="Card number" />);

      await user.type(getInput(), "4242424242424242");
      await user.type(getInput(), "9", {
        initialSelectionStart: 2,
        initialSelectionEnd: 2,
      });

      expect(getInput()).toHaveValue("4294 2424 2424 2424 2");
      expect(getInput()).toHaveProperty("selectionStart", 3);
    });

    it("moves the caret past a separator as it is inserted", async () => {
      const user = userEvent.setup();
      render(<CreditCardNumber label="Card number" />);

      await user.type(getInput(), "42424");

      expect(getInput()).toHaveProperty("selectionStart", 6);
    });

    it("deletes a digit when Backspace lands on a separator", async () => {
      const user = userEvent.setup();
      render(<CreditCardNumber label="Card number" />);

      await user.type(getInput(), "42424");
      await user.type(getInput(), "{Backspace}", {
        initialSelectionStart: 5,
        initialSelectionEnd: 5,
      });

      expect(getInput()).toHaveValue("4244");
    });

    it("deletes a digit when Delete lands on a separator", async () => {
      const user = userEvent.setup();
      render(<CreditCardNumber label="Card number" />);

      await user.type(getInput(), "42424");
      await user.type(getInput(), "{Delete}", {
        initialSelectionStart: 4,
        initialSelectionEnd: 4,
      });

      expect(getInput()).toHaveValue("4242");
    });

    it("deletes the whole selection", async () => {
      const user = userEvent.setup();
      render(<CreditCardNumber label="Card number" />);

      await user.type(getInput(), "4242424242");
      await user.type(getInput(), "{Backspace}", {
        initialSelectionStart: 4,
        initialSelectionEnd: 12,
      });

      expect(getInput()).toHaveValue("4242");
    });

    it("calls the consumer's onKeyDown", async () => {
      const user = userEvent.setup();
      const onKeyDown = vi.fn();
      render(<CreditCardNumber label="Card number" onKeyDown={onKeyDown} />);

      await user.type(getInput(), "4");

      expect(onKeyDown).toHaveBeenCalled();
    });

    it("leaves the caret alone when the consumer handles the key", async () => {
      const user = userEvent.setup();
      render(
        <CreditCardNumber
          label="Card number"
          onKeyDown={(event) => {
            if (event.key === "Backspace") {
              event.preventDefault();
            }
          }}
        />
      );

      await user.type(getInput(), "42424");
      await user.type(getInput(), "{Backspace}", {
        initialSelectionStart: 5,
        initialSelectionEnd: 5,
      });

      expect(getInput()).toHaveValue("4242 4");
      expect(getInput()).toHaveProperty("selectionStart", 5);
    });
  });

  describe("brand detection", () => {
    it("shows a placeholder mark while no brand is known", () => {
      const { container } = render(<CreditCardNumber label="Card number" />);

      expect(container.querySelector("[data-brand]")).toBeNull();
      expect(container.querySelector("svg")).toHaveAttribute(
        "aria-hidden",
        "true"
      );
      expect(screen.getByRole("status")).toBeEmptyDOMElement();
    });

    it("renders a mark for every brand it can recognise", () => {
      for (const definition of CARD_BRANDS) {
        expect(CARD_BRAND_LOGOS[definition.brand]).toBeTypeOf("function");
      }
    });

    it("names the brand once the digits identify one", async () => {
      const { container } = render(<CreditCardNumber label="Card number" />);
      const user = userEvent.setup();

      await user.type(getInput(), "4242");

      expect(container.querySelector("[data-brand]")).toHaveAttribute(
        "data-brand",
        "visa"
      );
      expect(screen.getByRole("status")).toHaveTextContent("Visa card");
    });

    it("swaps the mark when the brand changes", async () => {
      const { container } = render(<CreditCardNumber label="Card number" />);
      const user = userEvent.setup();

      await user.type(getInput(), "4242");

      const visaMark = container.querySelector("[data-brand] svg");

      await user.clear(getInput());
      await user.type(getInput(), "5555");

      expect(container.querySelector("[data-brand]")).toHaveAttribute(
        "data-brand",
        "mastercard"
      );
      expect(container.querySelector("[data-brand] svg")).not.toBe(visaMark);
    });

    it("waits for a digit that tells the brands apart", async () => {
      const user = userEvent.setup();
      render(<CreditCardNumber label="Card number" />);

      await user.type(getInput(), "6");

      expect(screen.getByRole("status")).toBeEmptyDOMElement();

      await user.type(getInput(), "5");

      expect(screen.getByRole("status")).toHaveTextContent("Discover card");
    });

    it("hides the mark from assistive technology, naming the brand instead", async () => {
      const { container } = render(<CreditCardNumber label="Card number" />);
      const user = userEvent.setup();

      await user.type(getInput(), "378282246310005");

      expect(container.querySelector("[data-brand] svg")).toHaveAttribute(
        "aria-hidden",
        "true"
      );
      expect(screen.getByRole("status")).toHaveTextContent(
        "American Express card"
      );
    });

    it("calls onBrandChange when the brand is recognised", async () => {
      const user = userEvent.setup();
      const onBrandChange = vi.fn();
      render(
        <CreditCardNumber label="Card number" onBrandChange={onBrandChange} />
      );

      await user.type(getInput(), "4242");

      expect(onBrandChange).toHaveBeenCalledTimes(1);
      expect(onBrandChange).toHaveBeenCalledWith("visa");
    });

    it("calls onBrandChange with null when the number is cleared", async () => {
      const user = userEvent.setup();
      const onBrandChange = vi.fn();
      render(
        <CreditCardNumber label="Card number" onBrandChange={onBrandChange} />
      );

      await user.type(getInput(), "4242");
      await user.clear(getInput());

      expect(onBrandChange).toHaveBeenLastCalledWith(null);
    });

    it("does not call onBrandChange for a brand that has not changed", async () => {
      const user = userEvent.setup();
      const onBrandChange = vi.fn();
      render(
        <CreditCardNumber label="Card number" onBrandChange={onBrandChange} />
      );

      await user.type(getInput(), "4242424242424242");

      expect(onBrandChange).toHaveBeenCalledTimes(1);
    });

    it("reports the brand of a controlled value", () => {
      render(<CreditCardNumber label="Card number" value="5555555555554444" />);

      expect(screen.getByRole("status")).toHaveTextContent("Mastercard card");
    });
  });

  describe("field states", () => {
    it("associates the description with the input", () => {
      render(
        <CreditCardNumber label="Card number" description="We never store it" />
      );

      expect(getInput()).toHaveAccessibleDescription("We never store it");
    });

    it("shows the error message when invalid", () => {
      render(
        <CreditCardNumber
          label="Card number"
          isInvalid
          errorMessage="Check the number"
        />
      );

      expect(getInput()).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByText("Check the number")).toBeInTheDocument();
    });

    it("disables the input when isDisabled", () => {
      render(<CreditCardNumber label="Card number" isDisabled />);

      expect(getInput()).toBeDisabled();
    });

    it("marks the input required when isRequired", () => {
      render(<CreditCardNumber label="Card number" isRequired />);

      expect(getInput()).toBeRequired();
    });

    it("renders the placeholder", () => {
      render(
        <CreditCardNumber
          label="Card number"
          placeholder="1234 5678 9012 3456"
        />
      );

      expect(
        screen.getByPlaceholderText("1234 5678 9012 3456")
      ).toBeInTheDocument();
    });

    it("forwards inputRef to the input element", () => {
      const ref = { current: null as HTMLInputElement | null };
      render(<CreditCardNumber label="Card number" inputRef={ref} />);

      expect(ref.current).toBe(getInput());
    });

    it("forwards a callback inputRef to the input element", () => {
      const inputRef = vi.fn();
      render(<CreditCardNumber label="Card number" inputRef={inputRef} />);

      expect(inputRef).toHaveBeenCalledWith(getInput());
    });

    it.each(["sm", "md", "lg"] as const)(
      'renders data-field-size="%s"',
      (size) => {
        const { container } = render(
          <CreditCardNumber label="Card number" size={size} />
        );

        expect(container.querySelector("[data-field-size]")).toHaveAttribute(
          "data-field-size",
          size
        );
      }
    );
  });
});
