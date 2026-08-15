/* Dark Arabic Console / language control: compact AR, FR, EN toggle with clear active state. */

import { languageOptions, type SiteLanguage } from "@/lib/i18n";

type Props = {
  language: SiteLanguage;
  onChange: (language: SiteLanguage) => void;
};

export default function LanguageSwitcher({ language, onChange }: Props) {
  return <div className="language-switcher" aria-label="Language selector">{languageOptions.map((option) => <button key={option.code} type="button" className={language === option.code ? "is-active" : ""} aria-pressed={language === option.code} onClick={() => onChange(option.code)}>{option.label}</button>)}</div>;
}
