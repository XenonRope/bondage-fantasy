import { ReactNode } from "react";
import { Translation } from "react-i18next";

function inRange(min?: number, max?: number) {
  return (value: string) => {
    if (min) {
      if (value.length < min) {
        if (min === 1) {
          return (
            <Translation>{(t) => t("common.fieldCannotBeEmpty")}</Translation>
          );
        } else {
          return (
            <Translation>
              {(t) => t("common.fieldTooShort", { minLength: min })}
            </Translation>
          );
        }
      }
    }
    if (max && value.length > max) {
      return (
        <Translation>
          {(t) => t("common.fieldTooLong", { maxLength: max })}
        </Translation>
      );
    }
  };
}

function notEmpty(customMessage?: string | ReactNode) {
  return (value: unknown) => {
    if (value == null || value === "") {
      return (
        customMessage ?? (
          <Translation>{(t) => t("common.fieldCannotBeEmpty")}</Translation>
        )
      );
    }
  };
}

export const Validators = {
  inRange,
  notEmpty,
};
