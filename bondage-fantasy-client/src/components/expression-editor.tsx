import { expressionHighlighting } from "../grammar/expression-highlight";
import { CodeEditor } from "./code-editor";
import { CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import { LanguageSupport, LRLanguage } from "@codemirror/language";
import { expressionParser, Operator, VARIABLES } from "bondage-fantasy-common";
import { ReactNode, useMemo } from "react";

function prepareLanguage(params: { variables: string[] }) {
  function autocomplete(context: CompletionContext): CompletionResult | null {
    const operationToken = context.tokenBefore(["Operation"]);
    if (operationToken != null) {
      const operationText = operationToken.text.replace(/\s+/g, "");
      if (operationText.startsWith('VARIABLE("')) {
        const stringToken = context.tokenBefore(["String"]);
        if (
          stringToken != null &&
          (stringToken.text.length === 1 ||
            stringToken.text.charAt(stringToken.text.length - 1) !== '"')
        ) {
          return {
            from: stringToken.from + 1,
            options: params.variables.map((variable) => ({ label: variable })),
          };
        }
      }
    }

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
      parser: expressionParser.configure({ props: [expressionHighlighting] }),
      languageData: {
        autocomplete,
      },
    }),
  );

  return languageSupport;
}

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
