"use client";

import { getAverageRGB, setCloudMetadata, useReload } from "../../utils";
import Image from "next/image";
import { RefObject, useEffect, useRef, useState } from "react";
import { RiLoader4Line } from "react-icons/ri";

import { useTranslations } from "next-intl";
import BaseView from "../BaseView/BaseView";

export default function Card({
  title,
  bookId,
  coverId,
  isFavorite,
  className,
  showTools = true,
}: {
  title: string;
  bookId: string;
  coverId: string;
  isFavorite?: boolean;
  className?: string;
  showTools?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const [cover, setCover] = useState<string | null>(null);
  const [colors, setColors] = useState<{
    r: number;
    g: number;
    b: number;
  } | null>();

  const card = cardRef.current;

  const t = useTranslations("Card");
  const [reload, setReload] = useReload();

  const setBackground = (cover: string) => {
    if (!cover) return;

    setColors(getAverageRGB(cover));

    if (card && colors)
      card.style.background = `rgb(${colors.r}, ${colors.g}, ${colors.b})`;
  };

  useEffect(() => {
    const getCover = localStorage.getItem(coverId);

    if (!getCover) return setReload();

    setCover(getCover);
    setBackground(getCover);
  }, [coverId, reload]);

  return (
    <BaseView
      title={title}
      bookId={bookId}
      coverId={coverId}
      isFavorite={isFavorite}
      showTools={showTools}
      baseRef={cardRef}
      setReload={setReload}
    >
      <div
        title={title}
        ref={cardRef}
        className={
          `flex flex-col cursor-pointer items-center justify-center h-[300px] w-44 border-2 hover:scale-105 transition-all duration-500 border-gray-200 rounded-xl p-2 ` +
          className
        }
      >
        <header className="flex flex-col items-center justify-center font-bold text-center h-15">
          {title.length > 25 ? title.slice(0, 25).concat("...") : title}
        </header>
        <hr className="w-full mb-2" />
        {cover || (cover && reload) ? (
          <Image
            src={cover}
            id={coverId}
            alt={t("title::cover", { title })}
            width={150}
            height={150}
            className="rounded-sm"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <RiLoader4Line className="text-7xl animate-spin" />
            <b>{t("message::loadingCover")}</b>
          </div>
        )}
      </div>
    </BaseView>
  );
}
