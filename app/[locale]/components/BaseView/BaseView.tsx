"use client";
import { ReactElement, RefObject, useRef, useState } from "react";
import { dataMapType } from "../../types";
import { setCloudMetadata } from "../../utils";
import { redirect } from "next/navigation";
import Modal from "../Modal/Modal";
import { deleteFile } from "../../googleAPI";

import {
  RiDeleteBin7Line,
  RiDownloadCloudLine,
  RiStarFill,
  RiStarLine,
} from "react-icons/ri";
import { useTranslations } from "next-intl";

export default function BaseView({
  title,
  bookId,
  coverId,
  isFavorite,
  baseRef,
  children,
  toolsClassName,
  setReload,
  showTools = true,
}: {
  title: string;
  bookId: string;
  coverId: string;
  baseRef: RefObject<HTMLElement | null>;
  isFavorite?: boolean;
  toolsClassName?: string;
  showTools?: boolean;
  setReload: Function;
  children: ReactElement;
}) {
  const deleteBookButtonRef = useRef<HTMLButtonElement>(null);
  const downloadButtonRef = useRef<HTMLButtonElement>(null);
  const favoriteButtonRef = useRef<HTMLButtonElement>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const wrapper = wrapperRef.current;

  const [favorite, setFavorite] = useState<boolean>(isFavorite ?? false);

  const t = useTranslations("Card");

  const setAsLastOpened = async () => {
    const dataMap: dataMapType = JSON.parse(
      localStorage.getItem("dataMap") ?? "",
    );

    dataMap.lastOpenedBook = bookId;

    localStorage.setItem("dataMap", JSON.stringify(dataMap));
    await setCloudMetadata(dataMap);

    redirect(`/pdfPage?id=${bookId}`);
  };

  const deleteBook = async () => {
    deleteBookButtonRef.current?.click();
    deleteBookButtonRef.current?.remove();
    downloadButtonRef.current?.remove();
    favoriteButtonRef.current?.remove();

    const base = baseRef.current;
    const isBookDeleted = await deleteFile(bookId, title);
    const isCoverDeleted = await deleteFile(coverId, title);
    const dataMap: dataMapType = JSON.parse(
      localStorage.getItem("dataMap") ?? "",
    );

    if (!base || !wrapper) return;

    base.classList.add("saturate-0");
    base.classList.remove("hover:scale-105");

    const bookIndex = dataMap.books.findIndex(({ id }) => id == bookId);
    dataMap.books.splice(bookIndex, 1);

    localStorage.setItem("dataMap", JSON.stringify(dataMap));
    localStorage.removeItem(bookId);
    localStorage.removeItem(coverId);

    base.classList.add("scale-0");
    await setCloudMetadata(dataMap).then(() => {
      console.log(`file ${bookId} Deleted!`, isBookDeleted, isCoverDeleted);

      wrapper.classList.add("hidden");
    });

    setReload();
  };

  const downloadBook = () => {
    const book = localStorage.getItem(bookId);
    const link = document.createElement("a");

    link.href = book ?? "";
    link.download = title + ".pdf";
    link.click();
  };

  const setAsFavorite = async () => {
    const dataMap: dataMapType = JSON.parse(
      localStorage.getItem("dataMap") ?? "",
    );

    const bookIndex = dataMap.books.findIndex((book) => book.id == bookId);
    dataMap.books[bookIndex].userPrefs.favorite = !isFavorite;

    setFavorite(!favorite);

    localStorage.setItem("dataMap", JSON.stringify(dataMap));
    await setCloudMetadata(dataMap);
  };

  return (
    <>
      <div
        ref={wrapperRef}
        className="w-full relative group"
        onClick={setAsLastOpened}
      >
        {children}
        {showTools && (
          <div
            className={
              "md:opacity-0 group-hover:opacity-100 duration-500 hover:scale-105 transition-all flex flex-col gap-2 absolute bottom-2 right-1 " +
              toolsClassName
            }
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={setAsFavorite}
              ref={favoriteButtonRef}
              className="z-2 border-2 border-white cursor-pointer  bg-red-900 rounded-xl p-2"
            >
              {favorite == true ? (
                <RiStarFill title={t("message::favorite")} />
              ) : (
                <RiStarLine title={t("message::notFavorite")} />
              )}
            </button>
            <button
              ref={downloadButtonRef}
              title={t("message::download")}
              onClick={() => downloadBook()}
              className="z-2 border-2 border-white cursor-pointer bg-red-900 rounded-xl p-2"
            >
              <RiDownloadCloudLine />
            </button>
            <button
              ref={deleteBookButtonRef}
              title={t("Delete.message::delete")}
              className="z-2 border-2 border-white cursor-pointer bg-red-900 rounded-xl p-2"
            >
              <RiDeleteBin7Line />
            </button>
          </div>
        )}
      </div>
      {showTools && (
        <Modal
          title={`🟥 ` + t("Delete.title::modal::delete", { title: title })}
          openButtonRef={deleteBookButtonRef}
          className="w-[90vw] md:w-fit"
        >
          <div className="flex flex-col items-center justify-center text-center w-full gap-10">
            {t("Delete.message::modal::delete", { title: title })}
            <span className="flex gap-10 items-center justify-center w-full">
              <button
                onClick={deleteBook}
                className="border rounded-xl p-2 hover:bg-red-900 transition-colors  duration-500 cursor-pointer disabled:bg-gray-700 disabled:text-gray-200 disabled:opacity-34 w-40 h-15"
              >
                {t("Delete.option::modal::yes")}
              </button>
              <button
                onClick={() => deleteBookButtonRef.current?.click()}
                className="border rounded-xl hover:bg-green-900 transition-colors duration-500 p-2 cursor-pointer break-words w-40 disabled:bg-gray-700 disabled:text-gray-200 disabled:opacity-34 h-15"
              >
                {t("Delete.option::modal::no")}
              </button>
            </span>
          </div>
        </Modal>
      )}
    </>
  );
}
