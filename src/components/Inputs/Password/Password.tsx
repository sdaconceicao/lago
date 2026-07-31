"use client";
import { Eye, EyeOff } from "lucide-react";
import { useCallback, useState } from "react";
import { FieldButton } from "@/components/Inputs/FormComponents/index";
import {
  TextField,
  type TextFieldProps,
} from "@/components/Inputs/TextField/TextField";

/** Reveal toggle labels, so the button reads correctly in either state. */
const SHOW_LABEL = "Show password";
const HIDE_LABEL = "Hide password";

export interface PasswordProps
  extends Omit<TextFieldProps, "type" | "button" | "children"> {
  /**
   * Whether the field offers a trailing button that reveals the value in plain
   * text. Set it to false where a masked value must stay masked. Defaults to
   * true.
   */
  isRevealable?: boolean;
}

/**
 * A masked single-line entry field. Password is a TextField locked to
 * `type="password"` with a trailing button that reveals the value in plain
 * text, so it keeps the label, description, validation states, and field
 * sizing every other field has. Pass `autoComplete` — `"current-password"` on
 * a sign-in form, `"new-password"` when the user is choosing one — so browsers
 * and password managers fill and save the right value.
 */
export function Password({ isRevealable = true, ...props }: PasswordProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  const toggleRevealed = useCallback(() => {
    setIsRevealed((revealed) => !revealed);
  }, []);

  return (
    <TextField
      {...props}
      type={isRevealed ? "text" : "password"}
      suffix={
        isRevealable ? (
          // The Group inside TextField only marks itself disabled; the button
          // has to be told, the same way SearchField tells its submit button.
          <FieldButton
            aria-label={isRevealed ? HIDE_LABEL : SHOW_LABEL}
            isDisabled={props.isDisabled}
            onPress={toggleRevealed}
          >
            {isRevealed ? <EyeOff /> : <Eye />}
          </FieldButton>
        ) : undefined
      }
    />
  );
}
