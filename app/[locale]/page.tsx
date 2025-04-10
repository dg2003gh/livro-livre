"use client";

import Header from "./components/Header/Header";
import NewBook from "./components/NewBook/NewBook";
import Library from "./components/Library/Library";
import Notification from "./components/Notification/Notification";
import { useState } from "react";
import { useReload } from "./utils";
import TermsAndConditions from "./components/TermsAndConditions/ TermsAndConditions";
import PrivacyPolicy from "./components/PrivacyPolicy/PrivacyPolicy";

export default function Home() {
  const [sendNotification, setSendNotification] = useState<{
    title: string;
    content: string;
    author: string;
  }>();

  const [searchValue, setSearchValue] = useState<string>("");
  const [refreshLibrary, setRefreshLibrary] = useReload();

  return (
    <div>
      <Header
        setSearchValue={setSearchValue}
        setSendNotification={setSendNotification}
        setRefreshLibrary={setRefreshLibrary}
      />
      <main className="flex justify-center  md:justify-start">
        <Library
          setRefreshLibrary={setRefreshLibrary}
          refreshLibrary={refreshLibrary}
          searchValue={searchValue}
        />
        <NewBook
          setRefreshLibrary={setRefreshLibrary}
          setSendNotification={setSendNotification}
        />
      </main>
      <div className="fixed flex w-full md:w-fit bottom-8 justify-center md:flex-col md:bottom-10 md:gap-0 gap-5 z-11 md:left-14">
        <TermsAndConditions />
        <PrivacyPolicy />
      </div>
      <footer className="fixed z-10 bottom-5 bg-main p-10 w-[95vw] flex self-end gap-6 flex-wrap items-center justify-center border rounded-2xl left-1/2 transform -translate-x-1/2">
        <b className="absolute bottom-2 left-4 text-sm opacity-60 ">
          {process.env.APP_VERSION}
        </b>
        <span>
          <b>{"Livro Livre@2025"}</b>
        </span>
      </footer>
      {sendNotification ? (
        <Notification
          timeTilDie={5}
          title={sendNotification.title}
          content={sendNotification.content}
          author={sendNotification.author}
        />
      ) : null}
    </div>
  );
}
