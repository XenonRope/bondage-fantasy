import { CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import { LanguageSupport, LRLanguage } from "@codemirror/language";
import { parser } from "@grumptech/lezer-mustache";
import { VARIABLES } from "bondage-fantasy-common";
import { ReactNode, useMemo } from "react";
import { CodeEditor } from "./code-editor";

function prepareLanguage(params: { variables: string[] }) {
  function autocomplete(context: CompletionContext): CompletionResult | null {
    const word = context.matchBefore(/{{[#/^]?[a-zA-Z_]*/);
    if (word == null) {
      return null;
    }
    return {
      from: ["#", "/", "^"].includes(word.text[2])
        ? word.from + 3
        : word.from + 2,
      options: params.variables.map((variable) => ({ label: variable })),
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

export function TextTemplateEditor(props: {
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
  customVariables?: string[];
}) {
  const language = useMemo(() => {
    return prepareLanguage({
      variables: Array.from(
        new Set([...(props.customVariables ?? []), ...VARIABLES]),
      ),
    });
  }, [props.customVariables]);

  return <CodeEditor langauge={language} {...props} />;
}
