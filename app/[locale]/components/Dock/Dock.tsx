"use client";
import { useTranslations } from "next-intl";
import { themeType, themeColors } from "../../types";
import { PDFDocumentProxy } from "pdfjs-dist";
import { MouseEvent, useEffect, useRef } from "react";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArtboardLine,
  RiHome8Line,
} from "react-icons/ri";
import { rgbToHex } from "../../utils";
import DropDown from "../DropDown/DropDown";

export default function Dock({
  bookIndex,
  currentPage,
  pdfDoc,
  setZoom,
  setCurrentPage,
  theme,
  setShowAnnotation,
}: {
  bookIndex: number;
  currentPage: number;
  pdfDoc: PDFDocumentProxy;
  setZoom: Function;
  setCurrentPage: Function;
  theme: themeType;
  setShowAnnotation: Function;
}) {
  const t = useTranslations("PdfViewer.Dock");

  const scaleRef = useRef<HTMLButtonElement>(null);
  const scaleListRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentPageTheme =
    JSON.stringify(theme.bg) == JSON.stringify(themeColors.black);

  const ISSERVER = typeof window === "undefined";
  const dataMap = !ISSERVER
    ? JSON.parse(localStorage.getItem("dataMap") ?? "null")
    : null;

  const onPageChange = (num: number) => {
    dataMap.books[bookIndex].userPrefs.lastViewedPage = num;

    localStorage.setItem("dataMap", JSON.stringify(dataMap));
  };

  const nextPage = () => {
    onPageChange(currentPage + 1);
    pdfDoc && currentPage < pdfDoc.numPages;
    setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    onPageChange(currentPage - 1);
    currentPage > 1;
    setCurrentPage(currentPage - 1);
  };

  const changeButtonTheme = () => {
    if (!buttonRef.current) return;

    buttonRef.current.style.background = currentPageTheme
      ? rgbToHex(themeColors.white)
      : rgbToHex(themeColors.black);
  };

  const changeTheme = () => {
    changeButtonTheme();

    const currentTheme: themeType =
      JSON.stringify(theme.bg) == JSON.stringify(themeColors.white)
        ? { bg: themeColors.black, fg: themeColors.white }
        : { bg: themeColors.white, fg: themeColors.black };

    dataMap.books[bookIndex].userPrefs.theme = currentTheme;

    localStorage.setItem("dataMap", JSON.stringify(dataMap));
    document.location.reload();
  };

  const scaleMark = () => {
    const scaleList = scaleListRef.current;
    const scale = dataMap.books[bookIndex].userPrefs.scale;

    if (!scaleList || !scale) return;

    Array.from(scaleList.children).forEach((li) =>
      li.innerHTML == scale
        ? li.classList.add("text-gray-700", "font-extrabold")
        : li.classList.remove("text-gray-700", "font-extrabold"),
    );
  };

  const changeScale = (event: MouseEvent<HTMLLIElement>) => {
    const scale: string = event.currentTarget.innerText;

    setZoom(Number(scale));
    dataMap.books[bookIndex].userPrefs.scale = scale;

    scaleMark();

    localStorage.setItem("dataMap", JSON.stringify(dataMap));

    document.location.reload();
  };

  useEffect(() => {
    changeButtonTheme();
    scaleMark();
  }, [changeButtonTheme, scaleMark, theme]);

  return (
    <>
      <div className="fixed z-10 bottom-2 flex p-2 gap-5 md:gap-10 bg-[rgba(0,0,0,0.5)] backdrop-blur-md w-fit h-fit rounded-xl items-center justify-center">
        <a
          href="/"
          className="flex font-bold md:gap-5 cursor-pointer flex-col md:flex-row disabled:cursor-default disabled:text-gray-500 rounded-full items-center justify-center"
        >
          <RiHome8Line className="text-2xl text-center" />
          <b className="hidden md:block">{t("button::library")}</b>
        </a>
        <button
          className="flex font-bold cursor-pointer disabled:cursor-default disabled:text-gray-500 rounded-full items-center justify-center"
          onClick={prevPage}
          disabled={currentPage <= 1}
        >
          <RiArrowLeftSLine className="text-3xl" />
          <b className="hidden md:block">&nbsp;{t("button::previous")}</b>
        </button>
        <button
          className="flex font-bold text-center cursor-pointer disabled:text-gray-700 items-center justify-center rounded-full"
          onClick={nextPage}
          disabled={currentPage >= (pdfDoc?.numPages ?? -1)}
        >
          <b className="hidden md:block">{t("button::next")}&nbsp;</b>
          <RiArrowRightSLine className="text-3xl" />
        </button>
        <button
          title={t("title::scale")}
          onClick={(e) => e.currentTarget.focus()}
          className="group relative flex text-center cursor-pointer disabled:text-gray-700 items-center justify-center rounded-full"
        >
          <DropDown
            buttonText="aA"
            buttonRef={scaleRef}
            buttonClassList="w-0 h-0 border-none p-0"
            optionsClassList="w-fit left-1/2 transform -translate-x-1/2"
          >
            <span ref={scaleListRef}>
              <li onClick={changeScale}>0.5</li>
              <li onClick={changeScale}>1.0</li>
              <li onClick={changeScale}>1.5</li>
              <li onClick={changeScale}>2.0</li>
              <li onClick={changeScale}>2.5</li>
              <li onClick={changeScale}>3.0</li>
            </span>
          </DropDown>
        </button>
        <button
          title={t("title::draw")}
          className="cursor-pointer"
          onClick={() => {
            setShowAnnotation((prev: boolean) => !prev);
          }}
        >
          <RiArtboardLine className="text-2xl" />
        </button>
        <button
          title={t("title::theme")}
          className="rounded-full border border-white cursor-pointer w-8 h-8 "
          ref={buttonRef}
          onClick={changeTheme}
        ></button>
      </div>
      <b className="fixed top-2 right-2 p-2 rounded-xl bg-[rgba(0,0,0,0.5)] backdrop-blur-md">
        {t("pagesView", { current: currentPage, total: pdfDoc?.numPages })}
      </b>
    </>
  );
}
