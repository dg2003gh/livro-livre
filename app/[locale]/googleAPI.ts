import { getSession } from "next-auth/react";

export const findFileId = async (query: string) => {
  const session = await getSession();

  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=` +
        encodeURIComponent(query),
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      },
    );
    if (response.ok) {
      const body = await response.json();

      return body.files[0].id; // returns the first finding id
    } else console.error(response.status);
  } catch (error) {
    console.error(`Error: ${query} not found!: `, error);
  }
};

export const uploadFile = async (
  file: File,
  parents?: Array<string>,
): Promise<any> => {
  if (!file) return;

  const session = await getSession();
  const name = file.name;

  const metadata = {
    name,
    parents,
  };

  const body = new FormData();
  body.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], {
      type: "application/json",
    }),
  );
  body.append("file", file);

  try {
    const response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`,
      {
        method: "POST",
        body: body,
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      },
    );

    console.log(`Response upload file ${name}: `, response);
    return response;
  } catch (error) {
    console.error(`Error uploading file ${name}: `, error);
    return error;
  }
};

export const updateFile = async (
  fileId: string,
  file: File,
): Promise<Response | undefined> => {
  if (!file) return;

  const session = await getSession();
  const name = file.name;

  const metadata = {
    name,
  };

  const body = new FormData();
  body.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], {
      type: "application/json",
    }),
  );
  body.append("file", file);

  try {
    const response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`,
      {
        method: "PATCH",
        body: body,
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      },
    );

    console.log(`Response updating file ${name}: `, response);
    return response;
  } catch (error) {
    console.error(`Error updating file ${name}: `, error);
    return error as Response;
  }
};

export const createFolder = async (
  folderName: string,
  setSendNotification: Function,
  parents?: Array<string>,
) => {
  const session: any = await getSession();
  if (!folderName || !session) return;
  const metadata = {
    name: folderName,
    parents: parents,
    mimeType: "application/vnd.google-apps.folder",
  };

  const body = new FormData();
  body.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], {
      type: "application/json",
    }),
  );

  try {
    const response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files`,
      {
        method: "POST",
        body: body,
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    );

    const data = await response.json();
    if (response.ok) {
      console.log(`Folder created with ID: ${data.id}`);
      console.log(response);
      setSendNotification({
        title: `📁 Folder ${folderName} created!`,
        content: "Uploaded to user's google drive.",
        author: "from upload system",
      });

      return data.id;
    } else {
      console.log(`Error: ${data.error}`);
      setSendNotification({
        title: `📁 Folder ${folderName} could no be created!`,
        content: "Could not upload folder to user's google drive.",
        author: "from upload system",
      });
    }
  } catch (error) {
    console.error("Error: creating folder:", error);
  }
};

export const downloadFile = async (
  fileId: string,
): Promise<Response | undefined> => {
  const session = await getSession();

  if (!fileId || !session) return;

  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    );

    return response;
  } catch (error) {
    console.error(`Error downloading file ${fileId}: `, error);
    return error as Response;
  }
};

export const deleteFile = async (
  fileId: string,
  name?: string,
): Promise<any> => {
  const session = await getSession();

  if (!fileId || !session) return;

  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${(session as any).accessToken}`,
        },
      },
    );

    console.log(`Response delete file ${name}: `, response);

    return response;
  } catch (error) {
    console.error(`Error deleting file ${name}: `, error);
    return error;
  }
};
