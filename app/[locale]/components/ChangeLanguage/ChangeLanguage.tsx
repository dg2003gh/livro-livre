"use client";

import { usePathname, useRouter } from "@/app/i18n/navigation";
import { availableLanguages } from "@/app/i18n/routing";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import DropDown from "../DropDown/DropDown";

export default function ChangeLanguage({ title }: { title?: string }) {
  const langButtonRef = useRef<HTMLButtonElement>(null);
  const [currentLang, setCurrentLang] = useState<string>(availableLanguages[0]);
  const router = useRouter();
  const pathname = usePathname();

  const t = useTranslations("Header");

  const initLanguage = () => {
    const langButton = langButtonRef.current;
    const lang = localStorage.getItem("lang");

    if (!langButton) return;

    langButton.style.backgroundImage = `url('/imgs/flags/${lang ?? availableLanguages[0]}.svg')`;
  };

  const setLanguage = (lang: string) => {
    router.replace(pathname, { locale: lang });

    localStorage.setItem("lang", lang);
  };

  useEffect(() => {
    const currentLang = localStorage.getItem("lang");

    setCurrentLang((prevLang) => currentLang ?? prevLang);
    initLanguage();
  }, []);

  return (
    <DropDown
      title={t(`select::languages.${currentLang}`)}
      optionsClassList="right-10"
      buttonRef={langButtonRef}
    >
      {availableLanguages.map((lang: string, key: number) => {
        const selected = currentLang == lang ? "text-gray-400" : null;

        return (
          <li
            title={t(`select::languages.${lang}`)}
            onClick={() => setLanguage(lang)}
            className={
              "flex gap-5 items-center hover:text-gray-400 " + selected
            }
            key={key}
          >
            {
              <Image
                src={`/imgs/flags/${lang}.svg`}
                alt=""
                width={40}
                height={40}
              />
            }
            {t(`select::languages.${lang}`)}
          </li>
        );
      })}
    </DropDown>
  );
}
