import { parser } from "../grammar/expression-parser";
import { CodeEditor } from "./code-editor";
import { CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import { LanguageSupport, LRLanguage } from "@codemirror/language";
import { Operator } from "bondage-fantasy-common";
import { ReactNode } from "react";

function prepareLanguage() {
  function autocomplete(context: CompletionContext): CompletionResult | null {
    const word = context.matchBefore(/[a-zA-Z]*/);
    if (
      word == null ||
      (!context.tokenBefore(["Operator"]) && !context.explicit)
    ) {
      return null;
    }
    return {
      from: word.from,
      options: Object.values(Operator).map((operator) => ({ label: operator })),
    };
  }

  const languageSupport = new LanguageSupport(
    LRLanguage.define({
      name: "mustache",
      parser,
      languageData: {
        autocomplete,
      },
    }),
  );

  return languageSupport;
}

const language = prepareLanguage();

export function ExpressionEditor(props: {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: ReactNode;
  error?: ReactNode;
  maxLength?: number;
  className?: string;
  classNames?: {
    input?: string;
  };
}) {
  return <CodeEditor langauge={language} {...props} />;
}
