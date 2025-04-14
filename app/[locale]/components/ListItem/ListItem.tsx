"use client";
import { useTranslations } from "next-intl";
import Image from "next/image";
import BaseView from "../BaseView/BaseView";
import { useEffect, useRef, useState } from "react";
import { getAverageRGB, useReload } from "../../utils";

export default function ListItem({
  title,
  bookId,
  coverId,
  isFavorite,
  icons,
  releaseDate,
  author,
  showTools = true,
}: {
  title: string;
  bookId: string;
  coverId: string;
  releaseDate: string;
  author: string;
  isFavorite?: boolean;
  className?: string;
  icons?: boolean;
  showTools?: boolean;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const list = listRef.current;
  const [cover, setCover] = useState<string | null>(null);

  const t = useTranslations("Listview");
  const [reload, setReload] = useReload();

  const [colors, setColors] = useState<{
    r: number;
    g: number;
    b: number;
  } | null>();
  const setBackground = (cover: string) => {
    if (!cover) return;

    setColors(getAverageRGB(cover));

    if (list && colors)
      list.style.background = `rgb(${colors.r}, ${colors.g}, ${colors.b})`;
  };

  useEffect(() => {
    const getCover =
      typeof window != "undefined" ? localStorage.getItem(coverId) : null;
    if (!getCover) return setReload();

    setCover(getCover);
    setBackground(getCover);
  }, [coverId, cover, reload]);

  const listClassName = icons ? "pb-2" : "pb-12";

  return (
    <BaseView
      title={title}
      bookId={bookId}
      coverId={coverId}
      isFavorite={isFavorite}
      showTools={showTools}
      baseRef={listRef}
      toolsClassName="flex-row"
      setReload={setReload}
    >
      <li
        title={title}
        className="w-full border-2 border-white cursor-pointer hover:scale-105 transition-transform duration-500 flex flex-col rounded-xl"
      >
        <div className={listClassName + " rounded-xl"} ref={listRef}>
          <header className="flex border-b-2 border-white px-2">
            <b className="flex w-full gap-10">
              {icons ? <div>{t("title::cover")}</div> : null}
              <div>{t("title::bookTitle")}</div>
            </b>
            <b className="flex w-full gap-10">
              <div>{t("title::releaseDate")}</div>
              <div>{t("title::author")}</div>
            </b>
          </header>
          <div className="flex p-1 gap-2 break-words">
            <b className="flex w-full gap-10">
              {icons && cover ? (
                <Image
                  className="rounded-xl border-2 border-white"
                  src={cover}
                  id={coverId}
                  alt={t("title::cover", { title })}
                  width={50}
                  height={50}
                />
              ) : null}
              <b className="break-words w-full">{title}</b>
            </b>
            <b className="flex w-full gap-10">
              <div>{releaseDate}</div>
              <div>{author}</div>
            </b>
          </div>
        </div>
      </li>
    </BaseView>
  );
}
