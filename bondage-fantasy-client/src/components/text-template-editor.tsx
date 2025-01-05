import {
  autocompletion,
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";
import { LanguageSupport, LRLanguage } from "@codemirror/language";
import { parser } from "@grumptech/lezer-mustache";
import { Input } from "@mantine/core";
import { useUncontrolled } from "@mantine/hooks";
import CodeMirror, {
  EditorState,
  EditorView,
  minimalSetup,
  Transaction,
} from "@uiw/react-codemirror";
import { ReactNode } from "react";

const theme = EditorView.theme({
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-scroller": {
    fontFamily: "var(--input-font-family)",
  },
  ".cm-content": {
    paddingBottom: "0",
    paddingTop: "0",
  },
  ".cm-line": {
    padding: "0",
  },
});

function prepareMustacheLanguage() {
  function autocomplete(context: CompletionContext): CompletionResult | null {
    const word = context.matchBefore(/{{[#/]?[a-zA-Z]*/);
    if (word == null || word.from == word.to) {
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

const mustacheLanguage = prepareMustacheLanguage();

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
  const [value, handleChange] = useUncontrolled({
    value: props.value,
    defaultValue: props.defaultValue,
    onChange: props.onChange,
  });

  function isValid(transaction: Transaction): boolean {
    return (
      props.maxLength == null || transaction.newDoc.length <= props.maxLength
    );
  }

  return (
    <Input.Wrapper
      label={props.label}
      error={props.error}
      className={props.className}
    >
      <Input
        component="div"
        multiline={true}
        error={props.error}
        classNames={{ input: props.classNames?.input }}
      >
        <CodeMirror
          basicSetup={false}
          theme={theme}
          value={value}
          extensions={[
            minimalSetup({ drawSelection: false }),
            EditorState.changeFilter.of(isValid),
            EditorView.lineWrapping,
            autocompletion(),
            mustacheLanguage,
          ]}
          onChange={(value) => handleChange(value)}
        />
      </Input>
    </Input.Wrapper>
  );
}
