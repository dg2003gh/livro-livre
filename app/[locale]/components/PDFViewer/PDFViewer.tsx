"use client";

import * as PDFJS from "pdfjs-dist";
import type {
  PDFDocumentProxy,
  RenderParameters,
} from "pdfjs-dist/types/src/display/api";
import { useCallback, useRef, useState, useEffect } from "react";
import Dock from "../Dock/Dock";
import AnnotationDock from "../AnnotationDock/AnnotationDock";
import AnnotationCanvas from "../AnnotationCanvas/AnnotationCanvas";
import { dataMapType, themeType, Tools } from "../../types";
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
  const [zoom, setZoom] = useState<number>(storageScale);
  const theme: themeType = dataMap.books[bookIndex]?.userPrefs.theme;

  const [color, setColor] = useState<themeType>(theme);
  const [tool, setTool] = useState<Tools>(Tools.PENCIL);
  const [mouseDown, setMouseDown] = useState(false);
  const [showAnnotation, setShowAnnotation] = useState(false);

  let renderTask: PDFJS.RenderTask;

  const renderPage = useCallback(
    (pageNum: number, pdf = pdfDoc) => {
      const canvas = canvasRef.current;

      if (!canvas || !pdf) return;

      canvas.style.transform = `scale(${zoom})`;
      const scales = { 1: 3.2, 2: 4 },
        defaultScale = 1.5,
        scale =
          scales[window.devicePixelRatio as keyof typeof scales] ||
          defaultScale;

      pdf.getPage(pageNum).then((page) => {
        const viewport = page.getViewport({
          scale,
        });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const renderContext: RenderParameters = {
          canvasContext: ctx,
          viewport: viewport,
        };

        const originalTextRendering = renderContext.canvasContext.fillText;
        renderContext.canvasContext.fillText = (text, x, y, maxWidth) => {
          ctx.fillStyle = rgbToHex(theme.fg);
          return originalTextRendering.call(ctx, text, x, y, maxWidth);
        };

        if (bodyRef.current)
          bodyRef.current.style.background = rgbToHex(theme.bg);

        try {
          if (renderTask) renderTask.cancel();
          renderTask = page.render(renderContext);
          return renderTask.promise;
        } catch (error) {}
      });
    },
    [pdfDoc, theme, zoom],
  );

  useEffect(() => {
    renderPage(currentPage, pdfDoc);
  }, [pdfDoc, currentPage]);

  useEffect(() => {
    const loadingTask = PDFJS.getDocument(src);
    loadingTask.promise.then(setPdfDoc).catch(console.error);
  }, [src]);

  if (!pdfDoc) return null;

  return (
    <div
      ref={bodyRef}
      className="relative flex flex-col w-full h-full items-center justify-center py-20 sm:py-10 bg-white"
    >
      <div className="w-full">
        <div className="w-screen h-screen md:h-fit touch-manipulation">
          <canvas ref={canvasRef} className="w-full h-full" />
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
      </div>
      <Dock
        setZoom={setZoom}
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
