"use client";
import { MouseEvent, RefObject, useEffect, useRef, useState } from "react";
import { bookType, dataMapType, Orders, Visuals } from "../../types";
import Image from "next/image";
import {
  RiApps2Line,
  RiListCheck2,
  RiListOrdered,
  RiPriceTag3Fill,
  RiSearch2Line,
  RiSortAlphabetAsc,
  RiSortAlphabetDesc,
  RiStarSLine,
} from "react-icons/ri";
import Card from "../Card/Card";
import DropDown from "../DropDown/DropDown";
import { useTranslations } from "next-intl";
import ListItem from "../ListItem/ListItem";

export const visualizationType = (visual: Visuals, book: bookType) => {
  switch (visual) {
    case Visuals.GRID:
      return GRID(book);
    case Visuals.LIST:
      return LIST(book);
    case Visuals.LIST_ICONS:
      return LIST(book, true);
  }
};

const GRID = ({ id, title, bookCoverId, userPrefs }: bookType) => {
  return (
    <Card
      key={id}
      title={title}
      bookId={id}
      coverId={bookCoverId}
      isFavorite={userPrefs.favorite}
    />
  );
};

const LIST = (
  { id, title, bookCoverId, author, releaseDate, userPrefs }: bookType,
  icons?: boolean,
) => {
  return (
    <ListItem
      key={id}
      title={title}
      author={author}
      releaseDate={releaseDate}
      icons={icons}
      isFavorite={userPrefs.favorite}
      coverId={bookCoverId}
      bookId={id}
    />
  );
};

export const sortLibrary = (
  order: Orders,
  tagFilter: Array<string>,
  a: bookType,
  b: bookType,
) => {
  switch (order) {
    case Orders.ASCENDENT:
      return a.title.localeCompare(b.title);
    case Orders.DECRESCENT:
      return b.title.localeCompare(a.title);
    case Orders.FAVORITES:
      return b.userPrefs.favorite == true && a.userPrefs.favorite == false;
    case Orders.BY_TAG:
      return (
        b.tags.some((tag: string) =>
          tagFilter.some((tagf: string) => tag == tagf),
        ) &&
        !a.tags.some((tag: string) =>
          tagFilter.some((tagf: string) => tag == tagf),
        )
      );
  }
};

export default function LibraryFilters({
  setVisual,
  setOrder,
  setTagFilter,
}: {
  setVisual: Function;
  setOrder: Function;
  setTagFilter: Function;
}) {
  const visualsRef = useRef<HTMLDivElement>(null);
  const ordersRef = useRef<HTMLDivElement>(null);
  const tagButtonRef = useRef<HTMLButtonElement>(null);
  const [tagSearchValue, setTagSearchValue] = useState<string>("");

  const t = useTranslations("LibraryFilters");

  const initFilters = () => {
    const visual = document.querySelector(
      `#${localStorage.getItem("visual") ?? "Grid"}`,
    ) as HTMLDivElement;
    const order = document.querySelector(
      `#${localStorage.getItem("order") ?? "ASCENDENT"}`,
    ) as HTMLDivElement;

    if (!visual || !order) return;
    order.classList.add("bg-red-900", "rounded-xl");
    visual.classList.add("bg-red-900", "rounded-xl");
  };

  useEffect(initFilters);

  const onVisualsClick = (e: any, visual: Visuals) => {
    if (!visualsRef.current) return;

    const filtersWrapper = visualsRef.current.children;
    const children = Array.from(filtersWrapper);

    children.forEach((el: Element) => {
      el == e.currentTarget
        ? el.classList.add("bg-red-900", "rounded-xl")
        : el.classList.remove("bg-red-900");
    });

    setVisual(visual);
    localStorage.setItem("visual", e.currentTarget.id);
  };
  const onOrdersClick = (e: MouseEvent, order: Orders) => {
    if (!ordersRef.current) return;

    const filtersWrapper = ordersRef.current.children;
    const children = Array.from(filtersWrapper);

    children.forEach((el: Element) => {
      el == e.currentTarget
        ? el.classList.add("bg-red-900", "rounded-xl")
        : el.classList.remove("bg-red-900");
    });

    setOrder(order);

    localStorage.setItem("order", e.currentTarget.id);
  };

  const onTagFilterClick = (e: MouseEvent<HTMLInputElement>) => {
    const tagFilter = e.currentTarget.value;

    setTagFilter((prevArr: Array<string>) => {
      if (prevArr.includes(tagFilter)) {
        const findTagFilterIndex = prevArr.findIndex((tag) => tag == tagFilter);
        prevArr.splice(findTagFilterIndex, 1);

        return [...prevArr];
      } else return [...prevArr, tagFilter];
    });
  };

  const getTags = () => {
    const dataMap: dataMapType = JSON.parse(
      localStorage.getItem("dataMap") ?? "null",
    );

    if (!dataMap || dataMap == null) return;

    let tagSet: Array<string> = [];

    dataMap.books.forEach((book) => (tagSet = [...tagSet, ...book.tags]));

    const filterTagSet = tagSet.filter(
      (tag) =>
        (tag != "" && tag.includes(tagSearchValue)) ||
        (tag != "" && tagSearchValue == ""),
    );

    if (filterTagSet.length <= 0 && tagSearchValue != "")
      return (
        <li className="flex flex-col justify-center items-center my-12 text-center">
          {t("message::cantFind::order::tag", { value: tagSearchValue })}
          <Image src={"/imgs/cantfind-2.svg"} width={100} height={100} alt="" />
        </li>
      );

    return filterTagSet.map((tag, key) => (
      <li key={key} onClick={(e) => e.stopPropagation()}>
        <label className="flex gap-5 items-center text-xl">
          <input
            onClick={onTagFilterClick}
            type="checkbox"
            className="accent-red-900"
            value={tag}
          />
          <b>{tag}</b>
        </label>
      </li>
    ));
  };

  return (
    <div className="flex gap-5 ml-6 rounded-xl w-fit h-12 text-3xl p-2  bg-neutral-900">
      <span ref={visualsRef} className="flex gap-5 justify-center items-center">
        <RiApps2Line
          id="GRID"
          title={t("title::view::grid")}
          className="cursor-pointer rounded-xl p-1"
          onClick={(e) => onVisualsClick(e, Visuals.GRID)}
        />
        <RiListOrdered
          id="LIST"
          title={t("title::view::list")}
          className="cursor-pointer rounded-xl p-1"
          onClick={(e) => onVisualsClick(e, Visuals.LIST)}
        />
        <RiListCheck2
          id="LIST_ICONS"
          title={t("title::view::listIcons")}
          className="cursor-pointer rounded-xl p-1"
          onClick={(e) => onVisualsClick(e, Visuals.LIST_ICONS)}
        />
        |
      </span>
      <span ref={ordersRef} className="flex gap-5 justify-center items-center">
        <RiSortAlphabetAsc
          id="ASCENDENT"
          title={t("title::order::ascendent")}
          className="cursor-pointer"
          onClick={(e) => onOrdersClick(e, Orders.ASCENDENT)}
        />
        <RiSortAlphabetDesc
          id="DECRESCENT"
          title={t("title::order::decrescent")}
          className="cursor-pointer"
          onClick={(e) => onOrdersClick(e, Orders.DECRESCENT)}
        />
        <RiStarSLine
          id="FAVORITE"
          title={t("title::order::favorites")}
          className="cursor-pointer"
          onClick={(e) => onOrdersClick(e, Orders.FAVORITES)}
        />
        <div
          id="BYTAG"
          title={t("title::order::tag")}
          onClick={(e) => onOrdersClick(e, Orders.FAVORITES)}
          className="relative flex items-center justify-center"
        >
          <RiPriceTag3Fill />
          <DropDown
            buttonRef={tagButtonRef}
            buttonClassList="border-none absolute left-1/2 top-1/2 transform -translate-1/2"
            optionsClassList="-right-10"
            title={t("title::order::tag")}
          >
            <li
              onClick={(e) => e.stopPropagation()}
              className="flex gap-2 justify-center items-center"
            >
              <RiSearch2Line className="text-xl" />
              <input
                onChange={(e) => setTagSearchValue(e.currentTarget.value)}
                className="border-white text-xl"
                placeholder={t("placeholder::search::order::tag")}
              />
            </li>
            <hr />
            {getTags()}
          </DropDown>
        </div>
      </span>
    </div>
  );
}
