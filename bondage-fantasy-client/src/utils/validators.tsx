import { Trans } from "react-i18next";

function inRange(min?: number, max?: number) {
  return (value: string) => {
    if (min) {
      if (value.length < min) {
        if (min === 1) {
          return <Trans i18nKey="common.fieldCannotBeEmpty" />;
        } else {
          return (
            <Trans i18nKey="common.fieldTooShort" values={{ minLength: min }} />
          );
        }
      }
    }
    if (max && value.length > max) {
      return (
        <Trans i18nKey="common.fieldTooLong" values={{ maxLength: max }} />
      );
    }
  };
}

function notEmpty() {
  return (value: unknown) => {
    if (value == null || value === "") {
      return <Trans i18nKey="common.fieldCannotBeEmpty" />;
    }
  };
}

export const Validators = {
  inRange,
  notEmpty,
};
