import { CodeEditor } from "./code-editor";
import { CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import { LanguageSupport, LRLanguage } from "@codemirror/language";
import { parser } from "@grumptech/lezer-mustache";
import { ReactNode } from "react";

function prepareLanguage() {
  function autocomplete(context: CompletionContext): CompletionResult | null {
    const word = context.matchBefore(/{{[#/]?[a-zA-Z]*/);
    if (word == null) {
      return null;
    }
    return {
      from: ["#", "/"].includes(word.text[2]) ? word.from + 3 : word.from + 2,
      options: [
        { label: "name" },
        { label: "hasVagina" },
        { label: "hasOnlyVagina" },
        { label: "hasPenis" },
        { label: "hasOnlyPenis" },
        { label: "isFuta" },
        { label: "sheHer" },
        { label: "heHim" },
      ],
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
}) {
  return <CodeEditor langauge={language} {...props} />;
}
