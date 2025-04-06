import { useCallback, useEffect, useState } from "react";
import { downloadFile, findFileId, updateFile, uploadFile } from "./googleAPI";
import { bookType, dataMapType } from "./types";

export const identifierCode: string =
  "Eu amo livro livre porque me faz sentir como uma barbuleta, so";
export const DATAMAP_KEY = "dataMap";

export const getAverageRGB = (src: string) => {
  const imgEl = document.createElement("img");
  imgEl.src = src;

  var blockSize = 5, // only visit every 5 pixels
    defaultRGB = { r: 0, g: 0, b: 0 }, // for non-supporting envs
    canvas = document.createElement("canvas"),
    context = canvas.getContext("2d"),
    data,
    width,
    height,
    i = -4,
    length,
    rgb = { r: 0, g: 0, b: 0 },
    count = 0;

  if (!context) {
    return defaultRGB;
  }

  height = canvas.height =
    imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
  width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

  context.drawImage(imgEl, 0, 0);

  try {
    data = context.getImageData(0, 0, width, height);
    length = data.data.length;

    while ((i += blockSize * 4) < length) {
      ++count;
      rgb.r += data.data[i];
      rgb.g += data.data[i + 1];
      rgb.b += data.data[i + 2];
    }
  } catch (e) {
    console.log(e);
  }

  // ~~ used to floor values
  rgb.r = ~~(rgb.r / count);
  rgb.g = ~~(rgb.g / count);
  rgb.b = ~~(rgb.b / count);

  return rgb;
};

export const saveFile = (filename: string, file: Blob) => {
  const reader = new FileReader();

  reader.addEventListener(
    "load",
    () => {
      if (!reader.result) return;
      const result: string = reader.result as string;
      // convert image file to base64 string and save to localStorage
      localStorage.setItem(filename, result);
    },
    false,
  );

  reader.readAsDataURL(file);
};

export const setCloudMetadata = async (dataMap: dataMapType) => {
  const file = new File([JSON.stringify(dataMap)], "metadata.json");
  const update = await updateFile(dataMap.metadataFileId, file);

  if (update) {
    localStorage.setItem(DATAMAP_KEY, JSON.stringify(dataMap));
  }
};

export function useReload(): [boolean, () => void] {
  const [reloading, setReloading] = useState(false);
  const reload = useCallback(() => {
    setReloading(true);
  }, [setReloading]);

  useEffect(() => {
    if (reloading) {
      setReloading(false);
    }
  }, [reloading, setReloading]);

  return [reloading, reload];
}

export const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }) => {
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
};

export const toRGB = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return {
    r,
    g,
    b,
  };
};

export const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState<{
    x: number | null;
    y: number | null;
  }>({ x: null, y: null });

  useEffect(() => {
    const updateMousePosition = (e: MouseEventInit) => {
      setMousePosition({ x: e.clientX ?? 0, y: e.clientY ?? 0 });
    };

    window.addEventListener("mousemove", updateMousePosition);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  return mousePosition;
};

export const getDataMapInCloud = async () => {
  const findMetadataQuery = `name = 'metadata.json' and fullText contains '${identifierCode}'`;
  const fileId = await findFileId(findMetadataQuery);

  const metadata = downloadFile(fileId);

  try {
    metadata.then(async (res) => {
      if (!res) return;

      const metadataBody: string = await res.text();

      localStorage.setItem(DATAMAP_KEY, metadataBody);
    });
  } catch (e) {
    console.log(e);
  }
};

export const saveBooks = () => {
  try {
    const dataMap: dataMapType = JSON.parse(
      localStorage.getItem(DATAMAP_KEY) ?? "null",
    );

    dataMap.books.map(async ({ id, bookCoverId }: bookType) => {
      const isDownloaded = localStorage.getItem(id);
      if (isDownloaded) return;

      const book = await downloadFile(id);
      const cover = await downloadFile(bookCoverId);

      if (book && cover) {
        try {
          const bookBody = await book.blob();
          const coverBody = await cover.blob();
          if (!bookBody || !coverBody) return;

          saveFile(id, bookBody);
          saveFile(bookCoverId, coverBody);
        } catch (e) {
          console.log(e);
        }
      }
    });
  } catch (e) {
    console.log(e);
  }
};
