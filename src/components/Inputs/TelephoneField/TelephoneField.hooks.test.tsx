import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import {
  type UseTelephoneFieldOptions,
  useTelephoneField,
} from "./TelephoneField.hooks";

function HookInput({
  nextCountry,
  ...props
}: UseTelephoneFieldOptions & { nextCountry?: string }) {
  const phone = useTelephoneField(props);

  return (
    <>
      <input
        aria-label="National telephone"
        type="tel"
        ref={phone.inputRef}
        value={phone.inputValue}
        onChange={(event) => phone.onChange(event.currentTarget.value)}
        onKeyDown={phone.onKeyDown}
      />
      {nextCountry && (
        <button
          type="button"
          onClick={() => phone.onCountryChange(nextCountry)}
        >
          Select {nextCountry}
        </button>
      )}
    </>
  );
}

const ControlledInput = ({
  onChange,
}: {
  onChange: (value: string) => void;
}) => {
  const [value, setValue] = useState("");

  return (
    <HookInput
      country="US"
      mask="0##-##"
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
};

const getInput = () =>
  screen.getByRole<HTMLInputElement>("textbox", { name: "National telephone" });

describe("useTelephoneField edit state", () => {
  it("keeps controlled edits and clearing pending until the owner accepts them", () => {
    const onChange = vi.fn();
    const initialProps = {
      country: "US",
      value: "+1 (212) 555-0123",
      onChange,
    };
    const { result, rerender } = renderHook(useTelephoneField, {
      initialProps,
    });

    act(() => result.current.onChange("(646) 555-9876"));

    expect(onChange).toHaveBeenCalledExactlyOnceWith("+1 (646) 555-9876");
    expect(result.current.inputValue).toBe("(212) 555-0123");
    expect(result.current.value).toBe(initialProps.value);

    rerender({ ...initialProps, value: "+1 (646) 555-9876" });
    expect(result.current.inputValue).toBe("(646) 555-9876");

    act(() => result.current.onChange(""));
    expect(onChange).toHaveBeenLastCalledWith("");
    expect(result.current.inputValue).toBe("(646) 555-9876");

    rerender({ ...initialProps, value: "" });
    expect(result.current.value).toBe("");
    expect(result.current.country).toBe("US");
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("accepts a pending controlled country without restoring truncated digits", () => {
    const onChange = vi.fn();
    const onCountryChange = vi.fn();
    const initialProps = {
      country: "US",
      defaultValue: "2125550123",
      onChange,
      onCountryChange,
    };
    const { result, rerender } = renderHook(useTelephoneField, {
      initialProps,
    });

    act(() => result.current.onCountryChange("SB"));

    expect(result.current.country).toBe("US");
    expect(result.current.value).toBe("+1 (212) 555-0123");
    expect(onChange).toHaveBeenLastCalledWith("+677 (212) 5550");

    rerender({ ...initialProps, country: "SB" });
    expect(result.current.country).toBe("SB");
    expect(result.current.inputValue).toBe("(212) 5550");

    act(() => result.current.onCountryChange("US"));
    expect(result.current.country).toBe("SB");
    expect(result.current.inputValue).toBe("(212) 5550");

    rerender(initialProps);
    expect(result.current.value).toBe("+1 (212) 555-0");
    expect(onCountryChange.mock.calls).toEqual([["SB"], ["US"]]);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("bases later proposals on the visible controlled value after a declined short-country change", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTelephoneField({
        value: "+1 (212) 555-0123",
        defaultCountry: "US",
        onChange,
      })
    );

    act(() => result.current.onCountryChange("SB"));
    act(() => result.current.onChange("(646) 555-9876"));
    act(() => result.current.onCountryChange("GB"));

    expect(onChange.mock.calls).toEqual([
      ["+677 (212) 5550"],
      ["+1 (646) 555-9876"],
      ["+44 (2125) 550-123"],
    ]);
    expect(result.current.country).toBe("US");
    expect(result.current.inputValue).toBe("(212) 555-0123");
  });

  it("keeps successive country selections from resurrecting discarded digits", () => {
    const onChange = vi.fn();
    const onCountryChange = vi.fn();
    const { result } = renderHook(() =>
      useTelephoneField({
        defaultCountry: "US",
        defaultValue: "2125550123",
        onChange,
        onCountryChange,
      })
    );

    for (const country of ["SB", "FO", "US"]) {
      act(() => result.current.onCountryChange(country));
    }

    expect(onChange.mock.calls).toEqual([
      ["+677 (212) 5550"],
      ["+298 (212) 555"],
      ["+1 (212) 555"],
    ]);
    expect(onCountryChange.mock.calls).toEqual([["SB"], ["FO"], ["US"]]);
    expect(result.current.country).toBe("US");
    expect(result.current.inputValue).toBe("(212) 555");
  });

  it.each([
    {
      pasted: "+298 242 567 999",
      country: "FO",
      callingCode: "298",
      inputValue: "(242) 567",
      value: "+298 (242) 567",
    },
    {
      pasted: "+44 20 7946 0958 123456",
      country: null,
      callingCode: "44",
      inputValue: "2079460958123",
      value: "+44 2079460958123",
    },
    {
      pasted: "+999123456789012345678",
      country: null,
      callingCode: "",
      inputValue: "999123456789012",
      value: "+999123456789012",
    },
  ])(
    "preserves the prefix and digit limit of $pasted",
    ({ pasted, ...expected }) => {
      const onChange = vi.fn();
      const onCountryChange = vi.fn();
      const { result } = renderHook(() =>
        useTelephoneField({ onChange, onCountryChange })
      );

      act(() => result.current.onChange(pasted));

      expect(result.current).toMatchObject(expected);
      expect(onChange).toHaveBeenCalledExactlyOnceWith(expected.value);
      expect(onCountryChange).not.toHaveBeenCalled();
    }
  );

  it("preserves an unresolved calling code through local edits and clearing", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useTelephoneField({ onChange }));

    act(() => result.current.onChange("+44 20 7946 0958"));
    act(() => result.current.onChange("20794609589"));

    expect(result.current.value).toBe("+44 20794609589");
    expect(result.current.country).toBeNull();
    expect(onChange).toHaveBeenLastCalledWith("+44 20794609589");

    act(() => result.current.onChange(""));
    expect(result.current.value).toBe("");
    expect(result.current.callingCode).toBe("44");
    expect(result.current.country).toBeNull();
    expect(onChange).toHaveBeenLastCalledWith("");

    act(() => result.current.onChange("1234"));
    expect(result.current.value).toBe("+44 1234");

    act(() => result.current.onChange(""));
    expect(result.current.callingCode).toBe("44");
    expect(result.current.country).toBeNull();
    expect(onChange).toHaveBeenLastCalledWith("");
  });

  it.each([
    ["+442079460958", "+44 2079460958"],
    ["+999123456", "+999123456"],
  ])(
    "keeps the default country when a controlled empty value rejects %s",
    (pasted, proposal) => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useTelephoneField({ value: "", onChange })
      );

      act(() => result.current.onChange(pasted));

      expect(result.current.inputValue).toBe("");
      expect(result.current.country).toBe("US");
      expect(result.current.callingCode).toBe("1");

      act(() => result.current.onChange("212"));

      expect(onChange.mock.calls).toEqual([[proposal], ["+1 (212)"]]);
      expect(result.current.inputValue).toBe("");
      expect(result.current.country).toBe("US");
      expect(result.current.callingCode).toBe("1");
    }
  );

  it("restores the default country after clearing an unrecognized international prefix", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useTelephoneField({ onChange }));

    act(() => result.current.onChange("+999123456"));
    expect(result.current.country).toBeNull();
    expect(result.current.callingCode).toBe("");

    act(() => result.current.onChange(""));
    expect(result.current.inputValue).toBe("");
    expect(result.current.country).toBe("US");
    expect(result.current.callingCode).toBe("1");

    act(() => result.current.onChange("212"));
    expect(result.current.inputValue).toBe("(212)");
    expect(result.current.value).toBe("+1 (212)");
    expect(result.current.country).toBe("US");
    expect(onChange.mock.calls).toEqual([["+999123456"], [""], ["+1 (212)"]]);
  });

  it("retains an unresolved prefix when a controlled clear is accepted and respects a later country override", () => {
    const onChange = vi.fn();
    const initialProps: UseTelephoneFieldOptions = {
      value: "+44 2079460958",
      onChange,
    };
    const { result, rerender } = renderHook(useTelephoneField, {
      initialProps,
    });

    act(() => result.current.onChange(""));

    expect(onChange).toHaveBeenCalledExactlyOnceWith("");
    expect(result.current.value).toBe("+44 2079460958");
    expect(result.current.callingCode).toBe("44");
    expect(result.current.country).toBeNull();

    rerender({ ...initialProps, value: "" });
    expect(result.current.value).toBe("");
    expect(result.current.callingCode).toBe("44");
    expect(result.current.country).toBeNull();

    act(() => result.current.onChange("1234"));
    expect(onChange).toHaveBeenLastCalledWith("+44 1234");
    expect(result.current.value).toBe("");

    rerender({ ...initialProps, value: "+44 1234" });
    expect(result.current.inputValue).toBe("1234");

    act(() => result.current.onChange(""));
    rerender({ ...initialProps, value: "" });
    expect(result.current.callingCode).toBe("44");
    expect(result.current.country).toBeNull();

    rerender({ ...initialProps, value: "", country: "US" });
    expect(result.current.callingCode).toBe("1");
    expect(result.current.country).toBe("US");

    act(() => result.current.onChange("212"));
    expect(onChange).toHaveBeenLastCalledWith("+1 (212)");
  });

  it("changes mask literals and formats without changing national digits or emitting edits", () => {
    const onChange = vi.fn();
    const initialProps: UseTelephoneFieldOptions = {
      defaultValue: "2125550123",
      defaultCountry: "US",
      onChange,
    };
    const { result, rerender } = renderHook(useTelephoneField, {
      initialProps,
    });

    rerender({ ...initialProps, mask: "##.##" });
    expect(result.current.value).toBe("+1 21.25550123");

    rerender({ ...initialProps, mask: "## / ##" });
    expect(result.current.value).toBe("+1 21 / 25550123");

    rerender({ ...initialProps, format: "spaces" });
    expect(result.current.value).toBe("+1 212 555 0123");

    rerender({ ...initialProps, format: "digits" });
    expect(result.current.value).toBe("+1 2125550123");
    expect(onChange).not.toHaveBeenCalled();

    act(() => result.current.onChange("6465559876"));
    expect(onChange).toHaveBeenCalledExactlyOnceWith("+1 6465559876");
  });
});

describe("useTelephoneField fixed numeric mask literals", () => {
  it("deletes editable digits after a multi-code-unit mask prefix", async () => {
    const user = userEvent.setup();
    render(<HookInput defaultValue="1" mask="📞0##" />);
    await user.click(getInput());
    getInput().setSelectionRange(2, 2);

    await user.keyboard("{Delete}");

    expect(getInput()).toHaveValue("");
  });

  it("inserts a fixed prefix once while typing and positions the first caret after the editable digit", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<HookInput mask="0##-##" onChange={onChange} />);

    await user.type(getInput(), "1");
    expect(getInput()).toHaveValue("01");
    expect(getInput().selectionStart).toBe(2);

    await user.type(getInput(), "234");
    expect(getInput()).toHaveValue("012-34");
    expect(onChange.mock.calls).toEqual([
      ["+1 01"],
      ["+1 012"],
      ["+1 012-3"],
      ["+1 012-34"],
    ]);
  });

  it("accepts each full callback as its controlled value without duplicating fixed digits", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledInput onChange={onChange} />);

    await user.type(getInput(), "1234");

    expect(getInput()).toHaveValue("012-34");
    expect(onChange.mock.calls).toEqual([
      ["+1 01"],
      ["+1 012"],
      ["+1 012-3"],
      ["+1 012-34"],
    ]);
  });

  it.each([
    {
      country: "BR",
      mask: "(##) 9####-####",
      digits: "11987654321",
      display: "(11) 98765-4321",
      fullValue: "+55 (11) 98765-4321",
    },
    {
      country: "US",
      mask: "##0-##",
      digits: "12034",
      display: "120-34",
      fullValue: "+1 120-34",
    },
  ])(
    "consumes a supplied middle literal when typing canonical $digits with $mask",
    async ({ country, mask, digits, display, fullValue }) => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <HookInput defaultCountry={country} mask={mask} onChange={onChange} />
      );

      await user.type(getInput(), digits);

      expect(getInput()).toHaveValue(display);
      expect(onChange).toHaveBeenLastCalledWith(fullValue);
      expect(onChange).toHaveBeenCalledTimes(digits.length);
    }
  );

  it("clears a value containing only its fixed prefix with Backspace", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<HookInput defaultValue="0" mask="0##-##" onChange={onChange} />);
    expect(getInput()).toHaveValue("0");

    await user.type(getInput(), "{Backspace}");

    expect(getInput()).toHaveValue("");
    expect(onChange).toHaveBeenCalledExactlyOnceWith("");
  });

  it("allows repeated Backspace to empty a mask containing only fixed literals", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<HookInput mask="00" onChange={onChange} />);

    await user.type(getInput(), "123");
    expect(getInput()).toHaveValue("00123");
    expect(onChange).toHaveBeenLastCalledWith("+1 00123");

    await user.keyboard(
      "{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}"
    );

    expect(getInput()).toHaveValue("");
    expect(onChange).toHaveBeenLastCalledWith("");
  });

  it("resolves a Brazilian international paste ahead of the default country with a fixed-digit mask", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onCountryChange = vi.fn();
    render(
      <HookInput
        defaultCountry="US"
        mask="(##) 9####-####"
        onChange={onChange}
        onCountryChange={onCountryChange}
      />
    );
    await user.click(getInput());

    await user.paste("+5511987654321");

    expect(getInput()).toHaveValue("(11) 98765-4321");
    expect(getInput().selectionStart).toBe(15);
    expect(onChange).toHaveBeenCalledExactlyOnceWith("+55 (11) 98765-4321");
    expect(onCountryChange).not.toHaveBeenCalled();
  });

  it.each([
    { key: "Delete", position: 1, expected: "130-4", caret: 1 },
    { key: "Backspace", position: 3, expected: "130-4", caret: 1 },
    { key: "Delete", position: 2, expected: "120-4", caret: 2 },
  ])(
    "$key at position $position preserves the middle fixed digit",
    async ({ key, position, expected, caret }) => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <HookInput defaultValue="1234" mask="##0-##" onChange={onChange} />
      );
      expect(getInput()).toHaveValue("120-34");
      await user.click(getInput());
      getInput().setSelectionRange(position, position);

      await user.keyboard(`{${key}}`);

      expect(getInput()).toHaveValue(expected);
      expect(getInput().selectionStart).toBe(caret);
      expect(onChange).toHaveBeenCalledExactlyOnceWith(`+1 ${expected}`);
    }
  );

  it("replaces editable slots across a selected fixed digit and separator", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<HookInput defaultValue="1234" mask="##0-##" onChange={onChange} />);
    await user.click(getInput());
    getInput().setSelectionRange(1, 5);

    await user.paste("9");

    expect(getInput()).toHaveValue("190-4");
    expect(getInput().selectionStart).toBe(2);
    expect(onChange).toHaveBeenCalledExactlyOnceWith("+1 190-4");
  });

  it("clears every editable digit and fixed literal together", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<HookInput defaultValue="1234" mask="0##-##" onChange={onChange} />);

    await user.clear(getInput());

    expect(getInput()).toHaveValue("");
    expect(onChange).toHaveBeenCalledExactlyOnceWith("");

    await user.type(getInput(), "5");
    expect(getInput()).toHaveValue("05");
    expect(onChange).toHaveBeenLastCalledWith("+1 05");
  });

  it.each(["012-34", "01234", "1234"])(
    "normalizes a whole-number paste of %s without duplicating the fixed prefix",
    async (pasted) => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<HookInput mask="0##-##" onChange={onChange} />);
      await user.click(getInput());

      await user.paste(pasted);

      expect(getInput()).toHaveValue("012-34");
      expect(getInput().selectionStart).toBe(6);
      expect(onChange).toHaveBeenCalledExactlyOnceWith("+1 012-34");
    }
  );

  it("counts fixed digits toward the selected country's national limit", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<HookInput mask="0##########" onChange={onChange} />);

    await user.type(getInput(), "1234567890");

    expect(getInput()).toHaveValue("0123456789");
    expect(onChange).toHaveBeenLastCalledWith("+1 0123456789");

    await user.clear(getInput());
    await user.paste("01234567890");
    expect(getInput()).toHaveValue("0123456789");
    expect(onChange).toHaveBeenLastCalledWith("+1 0123456789");
  });

  it.each([
    { key: "Backspace", position: 1, expected: "012-34", edits: 0 },
    { key: "Delete", position: 0, expected: "023-4", edits: 1 },
  ])(
    "$key beside the fixed prefix does not turn it into an editable digit",
    async ({ key, position, expected, edits }) => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <HookInput defaultValue="1234" mask="0##-##" onChange={onChange} />
      );
      await user.click(getInput());
      getInput().setSelectionRange(position, position);

      await user.keyboard(`{${key}}`);

      expect(getInput()).toHaveValue(expected);
      expect(onChange).toHaveBeenCalledTimes(edits);
      if (edits) expect(onChange).toHaveBeenLastCalledWith(`+1 ${expected}`);
    }
  );
});

describe("useTelephoneField native country change notification", () => {
  it("notifies once after an accepted country edit reaches the input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onCountryChange = vi.fn();
    const props = {
      defaultCountry: "US",
      defaultValue: "2125550123",
      nextCountry: "GB",
      onChange,
      onCountryChange,
    };
    const { rerender } = render(<HookInput {...props} />);
    const input = getInput();
    const nativeValues: string[] = [];
    input.addEventListener("change", () => nativeValues.push(input.value));

    await user.click(screen.getByRole("button", { name: "Select GB" }));

    expect(input).toHaveValue("(2125) 550-123");
    expect(nativeValues).toEqual(["(2125) 550-123"]);
    expect(onChange).toHaveBeenCalledExactlyOnceWith("+44 (2125) 550-123");
    expect(onCountryChange).toHaveBeenCalledExactlyOnceWith("GB");

    rerender(<HookInput {...props} onKeyDown={vi.fn()} />);
    expect(nativeValues).toHaveLength(1);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onCountryChange).toHaveBeenCalledTimes(1);
  });

  it.each(["country", "value"] as const)(
    "does not notify when the owner declines its controlled %s change",
    async (controlledProp) => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onCountryChange = vi.fn();
      const controlled =
        controlledProp === "country"
          ? { country: "US" }
          : { value: "+1 (212) 555-0123" };
      render(
        <HookInput
          {...controlled}
          defaultCountry="US"
          defaultValue="2125550123"
          nextCountry="GB"
          onChange={onChange}
          onCountryChange={onCountryChange}
        />
      );
      const input = getInput();
      const nativeValues: string[] = [];
      input.addEventListener("change", () => nativeValues.push(input.value));

      await user.click(screen.getByRole("button", { name: "Select GB" }));

      expect(input).toHaveValue("(212) 555-0123");
      expect(nativeValues).toEqual([]);
      expect(onChange).toHaveBeenCalledExactlyOnceWith("+44 (2125) 550-123");
      expect(onCountryChange).toHaveBeenCalledExactlyOnceWith("GB");
    }
  );

  it.each(["country", "value"] as const)(
    "waits for both controlled props before notifying when %s is accepted first",
    async (firstAcceptedProp) => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onCountryChange = vi.fn();
      const props = {
        country: "US",
        value: "+1 (212) 555-0123",
        nextCountry: "GB",
        onChange,
        onCountryChange,
      };
      const { rerender } = render(<HookInput {...props} />);
      const input = getInput();
      const nativeValues: string[] = [];
      input.addEventListener("change", () => nativeValues.push(input.value));

      await user.click(screen.getByRole("button", { name: "Select GB" }));
      expect(input).toHaveValue("(212) 555-0123");
      expect(nativeValues).toEqual([]);

      const firstAccepted =
        firstAcceptedProp === "country"
          ? { ...props, country: "GB" }
          : { ...props, value: "+44 (2125) 550-123" };
      rerender(<HookInput {...firstAccepted} />);
      expect(nativeValues).toEqual([]);

      const accepted = { ...props, country: "GB", value: "+44 (2125) 550-123" };
      rerender(<HookInput {...accepted} />);
      expect(input).toHaveValue("(2125) 550-123");
      expect(nativeValues).toEqual(["(2125) 550-123"]);

      rerender(<HookInput {...accepted} onKeyDown={vi.fn()} />);
      expect(nativeValues).toHaveLength(1);
      expect(onChange).toHaveBeenCalledExactlyOnceWith("+44 (2125) 550-123");
      expect(onCountryChange).toHaveBeenCalledExactlyOnceWith("GB");
    }
  );
});

describe("useTelephoneField native input editing", () => {
  it("inserts a middle digit, caps overflow, and leaves the caret beside the inserted digit", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<HookInput defaultValue="2125550123" onChange={onChange} />);

    await user.type(getInput(), "9", {
      initialSelectionStart: 2,
      initialSelectionEnd: 2,
    });

    expect(getInput()).toHaveValue("(291) 255-5012");
    expect(getInput().selectionStart).toBe(3);
    expect(onChange).toHaveBeenCalledExactlyOnceWith("+1 (291) 255-5012");
  });

  it("replaces a selected range spanning mask punctuation", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<HookInput defaultValue="2125550123" onChange={onChange} />);
    await user.click(getInput());
    getInput().setSelectionRange(4, 10);

    await user.paste("98");

    expect(getInput()).toHaveValue("(212) 980-123");
    expect(getInput().selectionStart).toBe(8);
    expect(onChange).toHaveBeenCalledExactlyOnceWith("+1 (212) 980-123");
  });

  it("deletes the selected range without expanding it across adjacent digits", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<HookInput defaultValue="2125550123" onChange={onChange} />);
    await user.click(getInput());
    getInput().setSelectionRange(4, 10);

    await user.keyboard("{Backspace}");

    expect(getInput()).toHaveValue("(212) 012-3");
    expect(getInput().selectionStart).toBe(4);
    expect(onChange).toHaveBeenCalledExactlyOnceWith("+1 (212) 012-3");
  });

  it.each([
    { key: "Backspace", position: 6, expected: "(215) 550-123", caret: 3 },
    { key: "Delete", position: 4, expected: "(212) 550-123", caret: 4 },
    { key: "Backspace", position: 10, expected: "(212) 550-123", caret: 8 },
    { key: "Delete", position: 9, expected: "(212) 555-123", caret: 9 },
  ])(
    "$key at position $position skips separators and deletes one digit",
    async ({ key, position, expected, caret }) => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<HookInput defaultValue="2125550123" onChange={onChange} />);
      await user.click(getInput());
      getInput().setSelectionRange(position, position);

      await user.keyboard(`{${key}}`);

      expect(getInput()).toHaveValue(expected);
      expect(getInput().selectionStart).toBe(caret);
      expect(onChange).toHaveBeenCalledExactlyOnceWith(`+1 ${expected}`);
    }
  );

  it("honors a consumer's prevented deletion before moving the caret", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <HookInput
        defaultValue="2125550123"
        onChange={onChange}
        onKeyDown={(event) => event.preventDefault()}
      />
    );
    await user.click(getInput());
    getInput().setSelectionRange(6, 6);

    await user.keyboard("{Backspace}");

    expect(getInput()).toHaveValue("(212) 555-0123");
    expect(getInput().selectionStart).toBe(6);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("edits across new mask literals after a prop change without losing the prefix", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const props = { defaultValue: "2125550123", onChange };
    const { rerender } = render(<HookInput {...props} mask="###.###.####" />);

    rerender(<HookInput {...props} mask="### / ### / ####" />);
    expect(getInput()).toHaveValue("212 / 555 / 0123");
    expect(onChange).not.toHaveBeenCalled();

    await user.type(getInput(), "{Backspace}", {
      initialSelectionStart: 6,
      initialSelectionEnd: 6,
    });

    expect(getInput()).toHaveValue("215 / 550 / 123");
    expect(getInput().selectionStart).toBe(2);
    expect(onChange).toHaveBeenCalledExactlyOnceWith("+1 215 / 550 / 123");

    rerender(<HookInput {...props} format="dashes" />);
    expect(getInput()).toHaveValue("215-550-123");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("replaces the whole local number with an international paste and keeps the new limit", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<HookInput defaultValue="2125550123" onChange={onChange} />);
    await user.click(getInput());
    getInput().select();

    await user.paste("+298 242 567 999");

    expect(getInput()).toHaveValue("(242) 567");
    expect(onChange).toHaveBeenLastCalledWith("+298 (242) 567");

    await user.type(getInput(), "8");
    expect(getInput()).toHaveValue("(242) 567");
    expect(onChange).toHaveBeenLastCalledWith("+298 (242) 567");
  });
});
