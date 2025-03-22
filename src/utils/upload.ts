// utils/upload.ts

// 生成基础64编码
export const getBase64 = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

// 生成视频缩略图
export const generateVideoThumbnail = (file: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const url = URL.createObjectURL(file);

    video.src = url;
    video.addEventListener("loadeddata", () => {
      video.currentTime = Math.min(0.1, video.duration);
    });

    video.addEventListener("seeked", () => {
      if (!context) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        const thumbUrl = URL.createObjectURL(blob!);
        resolve(thumbUrl);
        URL.revokeObjectURL(url);
      }, "image/jpeg");
    });
  });
};
