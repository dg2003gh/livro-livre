"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { RiGoogleFill } from "react-icons/ri";
import DropDown from "../DropDown/DropDown";

export default function SignInGoogle() {
  const { data: session } = useSession();
  const t = useTranslations("Header");

  const buttonRef = useRef<HTMLButtonElement>(null);
  const removeDatacloud = () => {};

  useEffect(() => {
    if (!session || !session.user || !buttonRef.current) return;

    buttonRef.current.style.backgroundImage = `url(${session.user.image})`;
  }, [session?.user]);

  if (session && session.user?.image) {
    return (
      <DropDown
        title={t("title::logged", { account: session.user.name ?? "" })}
        buttonRef={buttonRef}
      >
        <li
          className="hover:text-red-500 text-nowrap"
          onClick={removeDatacloud}
          title={t("title::deleteFromCloud")}
        >
          {t("title::deleteFromCloud")}
        </li>
        <li
          className="hover:text-red-500 text-nowrap"
          title={t("title::signOut")}
          onClick={() => signOut({ redirect: false })}
        >
          {t("title::signOut")}
        </li>
      </DropDown>
    );
  } else {
    return (
      <button
        title={t("title::signIn")}
        onClick={() => signIn("google")}
        className="flex justify-center items-center gap-2 border rounded-xl p-2 cursor-pointer hover:scale-105 transition-transform"
      >
        <RiGoogleFill /> {t("title::signIn")}
      </button>
    );
  }
}
