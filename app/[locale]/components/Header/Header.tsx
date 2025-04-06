"use client";
import {
  RiMenuLine,
  RiNewspaperLine,
  RiQuestionLine,
  RiRefreshLine,
  RiSearchLine,
} from "react-icons/ri";
import SignInGoogle from "../SignInGoogle/SignInGoogle";

import { getDataMapInCloud } from "@/app/[locale]/utils";
import { useEffect, useRef } from "react";
import Modal from "../Modal/Modal";
import { useSession } from "next-auth/react";
import ChangeLanguage from "../ChangeLanguage/ChangeLanguage";
import { useTranslations } from "next-intl";

export default function Header({
  setSearchValue,
  setSendNotification,
  setRefreshLibrary,
}: {
  setSearchValue: Function;
  setSendNotification: Function;
  setRefreshLibrary: Function;
}) {
  const refreshRef = useRef<HTMLButtonElement>(null);
  const infoRef = useRef<HTMLButtonElement>(null);
  const changeLogRef = useRef<HTMLButtonElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: session } = useSession();
  const t = useTranslations("Header");

  const refreshLibrary = async () => {
    const refreshButton = refreshRef.current;
    if (!refreshButton) return;
    refreshButton.disabled = true;

    refreshButton.classList.add("animate-spin");
    await getDataMapInCloud().then(() => {
      refreshButton.classList.remove("animate-spin");
      setSendNotification({
        title: "📙 Library refreshed!",
        content: "Library is syncronized.",
        author: "from Library system",
      });
      setRefreshLibrary();
      refreshButton.disabled = false;
    });
  };

  const search = (e: any) => {
    if (!searchInputRef.current) return;

    if (e.ctrlKey && e.code == "Slash") {
      searchInputRef.current.focus();
      searchInputRef.current.value = "";
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", search);
    return () => {
      window.removeEventListener("keydown", search);
    };
  });

  return (
    <>
      <header className="bg-red-900">
        <div className="flex justify-between items-center px-2 md:px-5">
          <h1 className="text-3xl md:text-3xl text-center m-2 md:m-10">
            📖<b className="hidden md:block">{t("text::library")}</b>
          </h1>
          {session && (
            <span className="flex justify-center items-center md:justify-start md:w-2/6 gap-2 bg-[rgba(0,0,0,0.5)] backdrop-blur-md py-1 px-2 rounded-xl">
              <RiSearchLine className="text-3xl" />
              <input
                ref={searchInputRef}
                onChange={(event) => setSearchValue(event.target.value)}
                className="w-full"
                placeholder={t("placeholder::search")}
              />
              <b className="opacity-0 md:opacity-100 text-gray-400">
                {"ctrl+/"}
              </b>
            </span>
          )}
          <RiMenuLine
            className="block md:hidden text-3xl hover:bg-red-900 cursor-pointer m-2"
            onClick={() => mobileRef.current?.classList.toggle("hidden")}
          />
          <div
            ref={mobileRef}
            onClick={() => mobileRef.current?.classList.toggle("hidden")}
            className="hidden bg-[rgba(0,0,0,0.5)] md:z-1 md:bg-transparent md:backdrop-blur-none md:flex-row md:flex backdrop-blur-md flex-col-reverse fixed z-12 top-0 left-0 right-0 bottom-0 md:static font-bold cursor-pointer items-center justify-center gap-10"
          >
            <div className="md:flex mt-32 md:mt-0">
              <button
                title={t("title::whatsNew")}
                ref={changeLogRef}
                className="flex gap-10 w-full cursor-pointer items-center p-2 md:hover:bg-transparent hover:bg-red-900"
              >
                <RiNewspaperLine className="text-2xl" />
                <div className="md:hidden">{t("title::whatsNew")}</div>
              </button>

              {session && (
                <button
                  ref={refreshRef}
                  title={t("title::syncLibrary")}
                  className="flex gap-10 items-center w-full cursor-pointer p-2 disabled:text-gray-400 hover:bg-red-900 md:hover:bg-transparent"
                  onClick={refreshLibrary}
                >
                  <RiRefreshLine className="text-2xl" />
                  <div className="md:hidden">{t("title::syncLibrary")}</div>
                </button>
              )}
              <button
                ref={infoRef}
                title={t("title::howToUse")}
                className="flex gap-10 cursor-pointer w-full items-center p-2 md:hover:bg-transparent hover:bg-red-900"
              >
                <RiQuestionLine className="text-3xl" />
                <div className="md:hidden">{t("title::howToUse")}</div>
              </button>
            </div>
            <span
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="absolute flex md:static md:hover:bg-transparent rounded-xl top-2 right-2 gap-2 justify-center items-center text-center"
            >
              <ChangeLanguage />
              <SignInGoogle />
            </span>
          </div>
        </div>
        <hr className="w-full border-2 border-b-white" />
      </header>
      <Modal
        title="❔ How do I use it?"
        footer="with ❤️ by Douglas Guimarães."
        openButtonRef={infoRef}
      >
        <div>hduikjhfjkdflshkljdfhsjklhfdsjklh</div>
      </Modal>
      <Modal
        title="📃 What's new?"
        footer="with ❤️ by Douglas Guimarães."
        openButtonRef={changeLogRef}
      >
        <div>
          <p>First release - beta-1v! 🥳 </p>
          <p>change log:</p>
          <ul className="list-inside list-disc">
            <li>Added library cloud sync</li>
            <li>Added library</li>
            <li>Added library filters</li>
            <li>Added pdf viewer</li>
            <li>Added draw by pdf page feature</li>
            <li>
              Added draw bases:
              <ul className="ml-10 list-disc">
                <li>pencil</li>
                <li>marker</li>
                <li>square</li>
                <li>circle</li>
                <li>Eraser</li>
                <li>change color</li>
                <li>change opacity</li>
              </ul>
            </li>
            <li>Added PDF theme</li>
            <li>
              Added translations to:
              <ul className="ml-10 list-disc">
                <li>🇦🇷 Argentinean Castilian</li>
                <li>🇧🇷 Brazilian Portuguese</li>
                <li>🇺🇸 English from united states of America</li>
              </ul>
            </li>
          </ul>
        </div>
      </Modal>
    </>
  );
}
