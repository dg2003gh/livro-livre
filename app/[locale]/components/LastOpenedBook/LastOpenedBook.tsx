"use client";

import { useTranslations } from "next-intl";
import { bookType, dataMapType } from "../../types";
import Card from "../Card/Card";
import { useSession } from "next-auth/react";

export default function LastOpenedBook() {
  const { data: session } = useSession();
  const t = useTranslations("Card");

  const ISSERVER = typeof window === "undefined";
  const dataMap: dataMapType = !ISSERVER
    ? JSON.parse(localStorage.getItem("dataMap") ?? "null")
    : null;

  if (!session || !dataMap.books || !dataMap.lastOpenedBook) return;

  return dataMap.books
    .filter(({ id }: bookType) => id == dataMap.lastOpenedBook)
    .map(({ id, bookCoverId }: bookType) => {
      return (
        <Card
          className="fixed right-0 md:right-5 motion-safe:animate-bounce duration-700 bottom-2 scale-50 z-11 hover:scale-50"
          key={id}
          title={t("title::lastOpened")}
          coverId={bookCoverId}
          bookId={id}
          showTools={false}
        />
      );
    });
}
