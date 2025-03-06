import { parseExpression } from "bondage-fantasy-common";
import { ReactNode } from "react";
import { Translation } from "react-i18next";
import { parseCommaSeparatedNumbers } from "./utils";

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

function notInList<T>(invalidValues: T[], customMessage: string | ReactNode) {
  return (value: T | null | undefined) => {
    if (invalidValues.includes(value as T)) {
      return customMessage;
    }
  };
}

function expression() {
  return (value: string | undefined | null) => {
    const [, error] = parseExpression(value ?? "");
    if (error) {
      return (
        <Translation>
          {(t) => t(`error.expressionParser.${error.type}`, { ...error })}
        </Translation>
      );
    }
  };
}

function commaSeparatedNumbers(params?: {
  minValue?: number;
  maxValue?: number;
  maxCount?: number;
}) {
  return (value: string | undefined | null) => {
    if (!value) {
      return;
    }
    const numbers = parseCommaSeparatedNumbers(value);
    if (
      numbers.some(isNaN) ||
      (params?.minValue != null &&
        numbers.some((number) => number < params.minValue!)) ||
      (params?.maxValue != null &&
        numbers.some((number) => number > params.maxValue!)) ||
      (params?.maxCount != null && numbers.length > params.maxCount!)
    ) {
      return <Translation>{(t) => t("common.invalidValue")}</Translation>;
    }
  };
}

export const Validators = {
  inRange,
  notEmpty,
  notInList,
  expression,
  commaSeparatedNumbers,
};
