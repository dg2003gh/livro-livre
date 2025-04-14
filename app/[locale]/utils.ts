import { useCallback, useEffect, useState } from "react";
import { downloadFile, findFileId, updateFile, uploadFile } from "./googleAPI";
import { bookType, dataMapType } from "./types";

export const isMobile = () => {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a,
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4),
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor);
  return check;
};

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

export const getDataMapInCloud = async (setRefreshLibrary: Function) => {
  const findMetadataQuery = `name = 'metadata.json' and fullText contains '${identifierCode}'`;
  const fileId = await findFileId(findMetadataQuery);

  return downloadFile(fileId).then(async (res) => {
    try {
      if (!res) return;

      await res.text().then((body) => {
        localStorage.setItem(DATAMAP_KEY, String(body));
        setRefreshLibrary();
      });

      return res;
    } catch (e) {
      console.log(e);
    }
  });
};

export const downloadTime = async (response: Response): Promise<Blob> => {
  const contentLength = response.headers.get("content-length");
  const total = contentLength ? parseInt(contentLength) : 0;
  const reader = response.body?.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;

  if (!reader) throw new Error("No body in response");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    if (value) {
      chunks.push(value);
      loaded += value.byteLength;

      if (total) {
        const percent = Math.round((loaded / total) * 100);
        console.log(`Downloaded ${percent}%`);
      }
    }
  }

  return new Blob(chunks);
};

export const saveBooks = async (setRefreshLibrary: Function) => {
  try {
    const dataMap: dataMapType = JSON.parse(
      localStorage.getItem(DATAMAP_KEY) ?? "null",
    );

    const promises = dataMap.books.map(
      async ({ id, bookCoverId }: bookType) => {
        const isDownloaded = localStorage.getItem(id);
        if (isDownloaded) return;

        try {
          // Download the book file
          const bookResponse = await downloadFile(id);
          if (bookResponse) {
            await downloadTime(bookResponse).then((book) => {
              saveFile(id, book);
            });
          }

          // Download the cover file
          const coverResponse = await downloadFile(bookCoverId);
          if (coverResponse) {
            await downloadTime(coverResponse).then((cover) => {
              saveFile(bookCoverId, cover);
            });
          }

          setTimeout(() => {
            setRefreshLibrary();
          }, 2000);
        } catch (error) {
          console.error("Error downloading files for book:", id, error);
        }
      },
    );

    await Promise.all(promises);
  } catch (e) {
    console.error("saveBooks failed:", e);
  }
};
