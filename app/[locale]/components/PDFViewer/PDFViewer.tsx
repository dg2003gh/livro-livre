"use client";

import * as PDFJS from "pdfjs-dist";
import type {
  PDFDocumentProxy,
  RenderParameters,
} from "pdfjs-dist/types/src/display/api";
import { useCallback, useRef, useState, useEffect } from "react";
import Dock from "../Dock/Dock";
import { dataMapType, themeType, Tools } from "../../types";

import AnnotationDock from "../AnnotationDock/AnnotationDock";
import AnnotationCanvas from "../AnnotationCanvas/AnnotationCanvas";
import { isMobile, rgbToHex } from "../../utils";

export default function PdfJs({
  src,
  bookId,
}: {
  src: string;
  bookId: string;
}) {
  PDFJS.GlobalWorkerOptions.workerSrc =
    "https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs";

  const ISSERVER = typeof window === "undefined";
  const dataMap: dataMapType = !ISSERVER
    ? JSON.parse(localStorage.getItem("dataMap") ?? "null")
    : null;

  const bookIndex = dataMap.books.findIndex((book) => book.id == bookId);
  const storageScale = dataMap.books[bookIndex]?.userPrefs.scale;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy>();
  const [currentPage, setCurrentPage] = useState(
    dataMap.books[bookIndex].userPrefs.lastViewedPage,
  );
  const [scale, setScale] = useState<number>(
    isMobile() ? storageScale - 0.1 : storageScale,
  );

  const theme: themeType = dataMap.books[bookIndex]?.userPrefs.theme;
  const [color, setColor] = useState<themeType>(theme);
  const [tool, setTool] = useState<Tools>(Tools.PENCIL);

  let renderTask: PDFJS.RenderTask;

  // Annotation
  const [mouseDown, setMouseDown] = useState(false);
  const [showAnnotation, setShowAnnotation] = useState(false);

  const renderPage = useCallback(
    (pageNum: number, pdf = pdfDoc) => {
      const canvas = canvasRef.current;
      if (!canvas || !pdf) return;

      pdf
        .getPage(pageNum)
        .then((page) => {
          // Set the viewport

          const viewport = page.getViewport({ scale: scale });
          canvas.style.width = `${viewport.width}px`;
          canvas.style.height = `${viewport.height}px`;

          canvas.width = viewport.width * window.devicePixelRatio;
          canvas.height = viewport.height * window.devicePixelRatio;

          const ctx = canvas.getContext("2d");

          if (!ctx) return;

          const renderContext: RenderParameters = {
            canvasContext: ctx!,
            viewport: viewport,
            background: "transparent",
          };

          const originalTextRendering = renderContext.canvasContext.fillText;

          renderContext.canvasContext.fillText = (text, x, y, maxWidth) => {
            ctx.fillStyle = rgbToHex(theme.fg); // Set the desired text color here

            return originalTextRendering.call(ctx, text, x, y, maxWidth);
          };

          if (bodyRef.current)
            bodyRef.current.style.background = rgbToHex(theme.bg);

          try {
            if (renderTask) {
              renderTask.cancel();
            }
            renderTask = page.render(renderContext);

            return renderTask.promise;
          } catch (error) {}
        })
        .catch((error) => console.log(error));
    },
    [pdfDoc, theme, scale],
  );

  useEffect(() => {
    renderPage(currentPage, pdfDoc);
  }, [pdfDoc, currentPage]);

  useEffect(() => {
    const loadingTask = PDFJS.getDocument(src);

    loadingTask.promise.then(
      (loadedDoc) => {
        setPdfDoc(loadedDoc);
      },
      (error) => {
        console.error(error);
      },
    );
  }, [src]);

  if (!pdfDoc) return;

  return (
    <div
      ref={bodyRef}
      className="py-24 relative flex flex-col w-full h-full items-center justify-center"
    >
      <div className="overflow-scroll">
        <canvas ref={canvasRef} className="md:p-0"></canvas>
        <AnnotationCanvas
          color={color}
          mouseDown={mouseDown}
          setMouseDown={setMouseDown}
          currentPage={currentPage}
          bookIndex={bookIndex}
          showAnnotation={showAnnotation}
          tool={tool}
        />
      </div>
      <Dock
        setScale={setScale}
        setCurrentPage={setCurrentPage}
        theme={theme}
        currentPage={currentPage}
        bookIndex={bookIndex}
        pdfDoc={pdfDoc}
        setShowAnnotation={setShowAnnotation}
      />
      <AnnotationDock
        color={color}
        setColor={setColor}
        setTool={setTool}
        tool={tool}
        showAnnotation={showAnnotation}
      />
    </div>
  );
}
