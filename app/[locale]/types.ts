export const themeColors = {
  black: { r: 0, g: 0, b: 0 },
  white: { r: 255, g: 255, b: 255 },
};

export type pagesAnnotationType = {
  pageNum: number;
  canvas: string;
};

export type themeColorType = { r: number; g: number; b: number; a?: number };
export type themeType = { bg: themeColorType; fg: themeColorType };

export type userPrefsType = {
  lastViewedPage: number;
  pagesAnnotation: Array<pagesAnnotationType>;
  scale: number;
  theme: themeType;
  favorite?: boolean;
};

export type bookType = {
  id: string;
  bookCoverId: string;
  title: string;
  releaseDate: string;
  author: string;
  tags: Array<string>;
  userPrefs: userPrefsType;
};

export type dataMapType = {
  identifierCode: string;
  folderMainId: string;
  folderCoversId: string;
  folderBooksId: string;
  books: Array<bookType>;
  lastOpenedBook: string;

  metadataFileId: string;
};

export type file = {
  id: string;
  cover: Blob;
  book: Blob;
};

export enum Tools {
  PENCIL,
  MARKER,
  RECTANGLE,
  CIRCLE,
  ARROW,
  TRIANGLE,
  ERASER,
  CLEAR_CANVAS,
}

export enum Visuals {
  LIST,
  LIST_ICONS,
  GRID,
}

export enum Orders {
  ASCENDENT,
  DECRESCENT,
  BY_TAG,
  FAVORITES,
}
