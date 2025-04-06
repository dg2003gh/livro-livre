"use client";

import { bookType, dataMapType, themeColors } from "../../types";
import { FormEvent, KeyboardEvent, RefObject, useRef } from "react";
import { RiDragDropLine, RiFunctionAddLine } from "react-icons/ri";
import {
  DATAMAP_KEY,
  identifierCode,
  setCloudMetadata,
} from "@/app/[locale]/utils";
import { createFolder, uploadFile } from "../../googleAPI";
import Modal from "../Modal/Modal";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function NewBook({
  setSendNotification,
}: {
  setSendNotification: Function;
  setRefreshLibrary: Function;
}) {
  const openNewBookRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const tagBox = tagRef.current;

  const t = useTranslations("NewBookForm");

  const addBookToDataMap = (book: bookType) => {
    const getDataMap = localStorage.getItem(DATAMAP_KEY);

    if (!getDataMap) return;
    const dataMap = JSON.parse(getDataMap);

    if (!dataMap.books) dataMap.books = [];
    dataMap.books.push(book);

    setCloudMetadata(dataMap).then();
  };

  const createDataMapIfNotExists = async (
    getDataMap: string,
  ): Promise<dataMapType> => {
    let dataMap = JSON.parse(getDataMap);

    if (!dataMap || Object.keys(dataMap).length == 0) {
      dataMap.identifierCode = identifierCode;

      // define default books folder in google drive
      dataMap.folderMainId = await createFolder(
        "livrolivre",
        setSendNotification,
      );

      // define covers folder
      dataMap.folderCoversId = await createFolder(
        "covers",
        setSendNotification,
        [dataMap.folderMainId],
      );

      // define books folder
      dataMap.folderBooksId = await createFolder("books", setSendNotification, [
        dataMap.folderMainId,
      ]);

      // define metadata.json
      const file = new File(Array(JSON.stringify(dataMap)), "metadata.json");
      const metadataResponse = await uploadFile(file, [dataMap.folderMainId]);
      const metadataData = await metadataResponse.json();
      dataMap.metadataFileId = metadataData.id;

      localStorage.setItem(DATAMAP_KEY, JSON.stringify(dataMap));
    }
    return dataMap;
  };

  const addNewBook = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    openNewBookRef.current?.click();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    form.submitButton.disabled = true;

    const getDataMap = localStorage.getItem(DATAMAP_KEY) ?? "null";

    const bookCover = formData.get("bookCover") as File;
    const book = formData.get("book") as File;

    const dataMap = await createDataMapIfNotExists(getDataMap);

    if (!bookCover || !book || !dataMap) return;

    setSendNotification({
      title: "📩 Uploading book...",
      content: "Uploading to user's google drive.",
      author: "from upload system",
    });

    try {
      const bookCoverResponse = await uploadFile(bookCover, [
        dataMap.folderCoversId,
      ]);
      const bookResponse = await uploadFile(book, [dataMap.folderBooksId]);

      if (bookCoverResponse.ok && bookResponse.ok) {
        const bookCoverData = await bookCoverResponse.json();
        const bookCoverId: string = bookCoverData.id;

        const bookData = await bookResponse.json();
        const bookId = bookData.id;

        const tags: Set<string> = new Set(
          String(formData.get("tags")).split(","),
        );

        const book: bookType = {
          id: bookId,
          bookCoverId: bookCoverId,
          title: String(formData.get("title")),
          releaseDate: String(formData.get("releaseDate")),
          author: String(formData.get("author")),
          tags: [...tags],
          userPrefs: {
            pagesAnnotation: [],
            lastViewedPage: 1,
            scale: 1,
            theme: {
              bg: themeColors.white,
              fg: themeColors.black,
            },
          },
        };

        addBookToDataMap(book);
        form.reset();
        if (tagBox) tagBox.innerHTML = "";

        setSendNotification({
          title: "✅ Book successfully uploaded!",
          content: "Uploading to user's google drive was a success.",
          author: "from upload system",
        });
      } else {
        setSendNotification({
          title: "❌ Book was not uploaded!",
          content:
            "Uploading to user's google drive was not successfully made. Try later...",
          author: "from upload system",
        });
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    }

    form.submitButton.disabled = false;
  };

  const beautifyTags = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!tagBox || event.code != "Space") return;

    const tags = new Set<string>(event.currentTarget.value.split(" "));

    tagBox.innerHTML = "";
    tags.forEach((tag: string) => {
      const tagEl = document.createElement("i");
      tagEl.classList = "bg-gray-900 w-fit h-fit p-2 rounded-xl text-center";

      tagEl.innerText = tag;

      tagBox.appendChild(tagEl);
    });
  };

  return (
    session?.user && (
      <>
        <div
          ref={openNewBookRef}
          title={t("button::addNewBook")}
          className="fixed top-44 right-5 cursor-pointer hover:scale-105 transition-all rounded-xl bg-[rgba(0,0,0,0.5)] backdrop-blur-md p-2 border "
        >
          <RiFunctionAddLine className="text-3xl" />
        </div>
        <Modal title={"📚 " + t("title::form")} openButtonRef={openNewBookRef}>
          <form onSubmit={addNewBook} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              {t("label::book::title")}
              <input
                required
                name="title"
                className=" p-2 border rounded-xl"
                placeholder={t("placeholder::book::title")}
              />
            </label>
            <label className="flex flex-col gap-2">
              {t("label::book::author")}
              <input
                required
                name="author"
                className=" p-2 border rounded-xl"
                placeholder={t("placeholder::book::author")}
              />
            </label>
            <label className="flex flex-col gap-2">
              {t("label::book::releaseDate")}
              <input
                required
                name="releaseDate"
                className=" p-2 border rounded-xl"
                type="date"
              />
            </label>
            <label className="relative flex flex-col gap-2">
              {t("label::book::addTags")}
              <input
                onKeyDown={beautifyTags}
                name="tags"
                placeholder={t("placeholder::book::addTags")}
                className="p-2"
              />
              <div ref={tagRef} className="flex w-full gap-2 "></div>
            </label>
            <label className="flex flex-col gap-2">
              {t("label::book::cover")}
              <p className="flex flex-col cursor-pointer gap-2 justify-center items-center p-2 border rounded-xl">
                <RiDragDropLine className="text-3xl" />
                <input required accept="image/*" type="file" name="bookCover" />
              </p>
            </label>
            <label className="flex flex-col gap-2">
              {t("label::book::file")}
              <p className="flex flex-col cursor-pointer gap-2 justify-center items-center p-2 border rounded-xl">
                <RiDragDropLine className="text-3xl" />
                <input
                  required
                  accept="application/pdf"
                  type="file"
                  name="book"
                />
              </p>
            </label>
            <button
              name="submitButton"
              type="submit"
              className="border hover:bg-green-900 transition-colors duration-500 rounded-xl p-2 cursor-pointer disabled:bg-gray-700 disabled:text-gray-200 disabled:opacity-34"
            >
              {t("button::form::addToLibrary")}
            </button>
          </form>
        </Modal>
      </>
    )
  );
}
