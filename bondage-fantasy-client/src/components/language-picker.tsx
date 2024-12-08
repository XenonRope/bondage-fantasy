import { Combobox, Image, InputBase, useCombobox } from "@mantine/core";
import { useTranslation } from "react-i18next";

const languages = [
  { language: "en", image: "/english.png" },
  { language: "pl", image: "/polish.png" },
];

function LanguageOption(props: { language: string }) {
  const { t } = useTranslation();
  const image = languages.find(
    ({ language }) => language === props.language,
  )!.image;

  return (
    <div className="flex items-center gap-2">
      <Image src={image} className="w-6 h-6" />
      {t(`common.language.${props.language}`)}
    </div>
  );
}

export function LanguagePicker() {
  const { i18n } = useTranslation();
  const combobox = useCombobox();

  const options = languages.map(({ language }) => (
    <Combobox.Option value={language} key={language}>
      <LanguageOption language={language} />
    </Combobox.Option>
  ));

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(language) => {
        i18n.changeLanguage(language);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          pointer
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents="none"
          onClick={() => combobox.toggleDropdown()}
          className="w-40"
        >
          <LanguageOption language={i18n.language} />
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
