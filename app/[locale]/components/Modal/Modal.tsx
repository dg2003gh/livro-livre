"use client";

import { ReactElement, RefObject, useEffect, useRef } from "react";

export default function Modal({
  children,
  openButtonRef,
  className,
  title,
  footer,
}: {
  children: ReactElement;
  openButtonRef: RefObject<HTMLElement | null>;
  className?: string;
  title?: string;
  footer?: string;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  const isModalOpened = useRef<boolean>(false);

  const toggleModal = (e: any) => {
    e.stopPropagation();

    const modal = modalRef.current;
    const layer = layerRef.current;

    if (!modal || !layer) return;

    modal.classList.toggle("translate-y-[500vw]");
    modal.classList.toggle("opacity-0");

    layer.classList.toggle("invisible");
    layer.classList.toggle("opacity-0");

    document.body.classList.toggle("overflow-hidden");

    isModalOpened.current = !modal.classList.contains("opacity-0");
  };

  const exit = (e: any) => {
    const openButton = openButtonRef.current;
    if (!openButton) return;

    if (e.code == "Escape" && isModalOpened.current) {
      openButton.click();
    }
  };

  useEffect(() => {
    const openButton = openButtonRef.current;
    if (!openButton) return;

    openButton.onclick = toggleModal;

    window.addEventListener("keydown", exit);

    return () => {
      window.removeEventListener("keydown", exit);
    };
  }, [openButtonRef.current]);
  return (
    <>
      <div
        ref={modalRef}
        className={
          `fixed z-13 w-[98vw] md:w-[70vw] bg-[rgba(0,0,0,0.5)] p-5 flex flex-col gap-5 backdrop-blur-md
           rounded-xl left-1/2  transform -translate-x-1/2 overflow-scroll  translate-y-[500vw] 
           duration-500 transition-all opacity-0 ` + className
        }
      >
        {title ? (
          <>
            <header className="flex justify-between text-2xl md:text-3xl">
              <b>{title}</b>
              <b
                className={`flex items-center justify-center w-10 h-10 border border-white
                            hover:bg-red-900 transition-colors duration-500 cursor-pointer 
                            rounded-full`}
                onClick={toggleModal}
              >
                {"x"}
              </b>
            </header>
            <hr />
          </>
        ) : null}
        <article>{children}</article>
        <footer>{footer}</footer>
      </div>
      <div
        onClick={toggleModal}
        ref={layerRef}
        className={`invisible fixed bg-[rgba(255,255,255,0.2)] backdrop-blur-md top-0 left-0 right-0 bottom-0 z-12 duration-500 transition-all opacity-0 overflow-hidden`}
      ></div>
    </>
  );
}
