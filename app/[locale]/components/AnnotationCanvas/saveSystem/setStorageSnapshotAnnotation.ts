import { dataMapType } from "@/app/[locale]/types";

export const setStorageSnapshotAnnotation = (
  bookIndex: number,
  currentPage: number,
  ctx: CanvasRenderingContext2D,
) => {
  try {
    const dataMap: dataMapType = JSON.parse(
      localStorage.getItem("dataMap") ?? "null",
    );
    const annotationIndex = dataMap.books[
      bookIndex
    ].userPrefs.pagesAnnotation.findIndex(
      (annotation) => annotation.pageNum == currentPage,
    );

    if (annotationIndex == -1) return;

    const canvasSnapshot =
      dataMap.books[bookIndex].userPrefs.pagesAnnotation[annotationIndex]
        .canvas;

    const img = new Image();
    img.src = canvasSnapshot;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
    };
  } catch (e) {
    console.error(e);
  }
};
