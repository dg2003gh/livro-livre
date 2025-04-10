"use client";

import { useEffect, useRef } from "react";

export default function Notification({
  title,
  content,
  author,
  timeTilDie = 5,
}: {
  title: string;
  content: string;
  author?: string;
  timeTilDie: number;
}) {
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const notification = notificationRef.current;
    if (!notification) return;

    notification.classList.remove("opacity-0", "translate-x-96");

    const notificationTimeOut = setTimeout(
      () => notification.classList.add("opacity-0", "translate-x-96"),
      timeTilDie * 1000,
    );

    return () => clearTimeout(notificationTimeOut);
  }, [title, content, author, timeTilDie]);

  return (
    <div
      ref={notificationRef}
      className="fixed z-14 right-5 bottom-52 transform translate-x-96 break-words p-2 bg-main rounded-xl w-1/3 md:w-1/5 h-fit transition-all duration-500 ease-in-out"
    >
      <header className="flex flex-col gap-2 mb-2">
        <b> {title} </b>
        <hr />
      </header>
      <div>{content}</div>
      <footer className="mt-5">
        <b>{author}</b>
      </footer>
    </div>
  );
}
