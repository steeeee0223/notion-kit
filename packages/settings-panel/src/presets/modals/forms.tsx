"use client";

import { useId } from "react";
import {
  AnyFieldApi,
  createFormHook,
  createFormHookContexts,
} from "@tanstack/react-form";

import {
  Field,
  FieldError,
  FieldLabel,
  Input,
  InputProps,
} from "@notion-kit/shadcn";

const { fieldContext, formContext } = createFormHookContexts();

// Allow us to bind components to the form to keep type safety but reduce production boilerplate
// Define this once to have a generator of consistent form instances throughout your app
const { useAppForm } = createFormHook({
  fieldComponents: {
    Text: ({
      field,
      label,
      inputProps = {},
    }: {
      field: AnyFieldApi;
      label?: string;
      inputProps?: InputProps;
    }) => {
      const id = useId();
      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
      return (
        <Field data-invalid={isInvalid}>
          {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
          <Input
            id={id}
            name={field.name as string}
            value={field.state.value as string}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            aria-invalid={isInvalid}
            {...inputProps}
          />
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    },
  },
  formComponents: {
    // SubmitButton,
  },
  fieldContext,
  formContext,
});

export { useAppForm };
