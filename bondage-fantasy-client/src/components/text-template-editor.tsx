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
          ]}
          onChange={(value) => handleChange(value)}
        />
      </Input>
    </Input.Wrapper>
  );
}
