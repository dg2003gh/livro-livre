import { dataMapType, pagesAnnotationType } from "@/app/[locale]/types";
import { identifierCode, setCloudMetadata } from "@/app/[locale]/utils";

export const saveAnnotationPage = (
  bookIndex: number,
  currentPage: number,
  canvas: HTMLCanvasElement,
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

    if (!canvas) return;

    const annotationObj: pagesAnnotationType = {
      pageNum: currentPage,
      canvas: canvas.toDataURL(),
    };

    if (annotationIndex != -1) {
      dataMap.books[bookIndex].userPrefs.pagesAnnotation[annotationIndex] =
        annotationObj;
    } else {
      dataMap.books[bookIndex].userPrefs.pagesAnnotation.push(annotationObj);
    }

    localStorage.setItem("dataMap", JSON.stringify(dataMap));

    setCloudMetadata(dataMap);
  } catch (e) {
    console.error(e);
  }
};
