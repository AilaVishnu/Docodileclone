import React from "react";
import { Field } from "../../Field";

// TextInput is now a thin alias for the canonical <Field variant="underline">.
// Kept so the many existing call sites don't have to change. The underline look,
// responsive --input-pady, and error handling all live in <Field> now.
type TextInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  type?: "text" | "password" | "email";
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (e?: React.FocusEvent<HTMLInputElement>) => void;
  error?: boolean;
  errorMessage?: string;
  maxLength?: number;
  multiline?: boolean;
};

export function TextInput(props: TextInputProps) {
  return <Field variant="underline" {...props} />;
}
