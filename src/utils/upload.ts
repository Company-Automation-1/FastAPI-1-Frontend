// utils/upload.ts

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
// import pLimit from "p-limit";

// 初始化 dayjs utc 插件
dayjs.extend(utc);

// 生成基础64编码
export const getBase64 = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    // 获取 base64 字符串
    reader.onload = () => {
      // 获取 base64 字符串
      const base64String = reader.result as string;
      // 移除 Data URL 的前缀（如 "data:image/jpeg;base64,"）
      const base64Data = base64String.split(",")[1];
      resolve(base64Data);
    };
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

// 文本截取
export const parseContent = (raw: string) => {
  if (!raw) return { title: "", content: "" };

  // 分行处理，去除空行
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  // 标题匹配模式
  const titlePattern = /^(?:["「]?(?:标题|Title)["」]?[：:]\s*)(.*)$/;
  // 正文匹配模式
  const contentPattern = /^(?:["「]?(?:正文|Content)["」]?[：:]\s*)(.*)$/;

  let title = "";
  let content = "";
  let isContentSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 检查是否是标题行
    const titleMatch = line.match(titlePattern);
    if (titleMatch && !isContentSection) {
      // 如果下一行不是 Content 开头，则认为是标题内容
      const nextLine = lines[i + 1];
      if (nextLine && !contentPattern.test(nextLine)) {
        title = titleMatch[1].trim();
      }
      continue;
    }

    // 检查是否是正文标识行
    const contentMatch = line.match(contentPattern);
    if (contentMatch) {
      isContentSection = true;
      // 如果正文标识行后面有内容，将其作为正文的第一行
      if (contentMatch[1]) {
        content = contentMatch[1];
      }
      continue;
    }

    // 如果已经进入正文部分，收集后续所有内容
    if (isContentSection) {
      content = content ? content + "\n" + line : line;
    }
    // 如果还没有找到标题，且行内容不是以 Content 开头，则可能是标题
    else if (!title && !contentPattern.test(line)) {
      // 支持 # 开头的标题格式
      if (line.startsWith("#")) {
        title = line.slice(1).trim();
      } else {
        title = line;
      }
    }
  }

  return {
    title: title.trim(),
    content: content.trim(),
  };
};

interface TreeNode {
  key: string;
  title: string;
  children?: TreeNode[];
  isLeaf?: boolean;
  file: File;
}

// 将时间字符串转换为秒级时间戳
const convertTimeStringToTimestamp = (timeString: string): number => {
  // 使用 dayjs 处理 yyyymmddhhmmss 格式，直接获取秒级时间戳
  return dayjs.utc(timeString, "YYYYMMDDHHmmss").unix();
  // // 使用 dayjs 处理 yyyymmddhhmmss 格式，获取毫秒级时间戳
  // return dayjs.utc(timeString, 'YYYYMMDDHHmmss').valueOf();
};

// 定义上传数据接口
interface UploadData {
  device_name: string;
  timestamp: number;
  title?: string;
  content?: string;
  files: {
    filename: string;
    data: string;
  }[];
}

// 处理上传的文件树
export const processUploadedFiles = async (
  treeData: TreeNode[]
): Promise<UploadData[]> => {
  const results: UploadData[] = [];
  const globalStart = performance.now();

  // 处理设备文件夹
  for (const deviceNode of treeData[0]?.children || []) {
    const deviceStart = performance.now();
    const deviceName = deviceNode.title;
    console.log(`🛠 开始处理设备: ${deviceName}`);

    // 处理时间文件夹
    for (const timeNode of deviceNode.children || []) {
      const timeStart = performance.now();
      const timeFolder = timeNode.title;
      console.log(`⏱ 开始处理时间文件夹: ${timeFolder}`);

      let contentFile: File | undefined;
      const imageFiles: File[] = [];

      // 处理 imgs 文件夹和 content.txt
      for (const item of timeNode.children || []) {
        if (item.title === "content.txt" && item.file) {
          contentFile = item.file;
        } else if (item.title === "imgs") {
          // 收集图片文件
          imageFiles.push(
            ...(item.children || [])
              .filter((imgNode) => imgNode.file)
              .map((imgNode) => imgNode.file!)
          );
        }
      }

      if (contentFile) {
        try {
          // 解析内容文件
          const contentStart = performance.now();
          const contentText = await contentFile.text();
          const { title, content } = parseContent(contentText);
          console.log(
            `📄 解析content.txt耗时: ${(
              performance.now() - contentStart
            ).toFixed(2)}ms`
          );

          // 处理图片文件
          if (imageFiles.length > 0) {
            const imagesStart = performance.now();
            const processedFiles = await Promise.all(
              imageFiles.map(async (file) => ({
                filename: file.name,
                data: await getBase64(file),
              }))
            );
            console.log(
              `🖼 处理${imageFiles.length}张图片耗时: ${(
                performance.now() - imagesStart
              ).toFixed(2)}ms`
            );

            // 时间转换耗时
            const timeConvertStart = performance.now();
            const timestamp = convertTimeStringToTimestamp(timeFolder);
            console.log(
              `🕰 时间转换耗时: ${(performance.now() - timeConvertStart).toFixed(
                2
              )}ms`
            );

            results.push({
              device_name: deviceName,
              timestamp,
              title,
              content,
              files: processedFiles,
            });
          }
        } catch (error) {
          console.error("❌ 处理文件失败:", error, contentFile);
        }
      }

      console.log(
        `✅ 完成时间文件夹处理: ${timeFolder}，耗时: ${(
          performance.now() - timeStart
        ).toFixed(2)}ms\n`
      );
    }

    console.log(
      `🎉 完成设备处理: ${deviceName}，总耗时: ${(
        performance.now() - deviceStart
      ).toFixed(2)}ms\n`
    );
  }

  console.log(
    `🚀 全部处理完成，总耗时: ${(performance.now() - globalStart).toFixed(2)}ms`
  );
  return results;
};

// // 定义并发控制（根据设备性能调整）
// const CONCURRENCY_LIMIT = 5; // 同时处理的图片数量
// const limit = pLimit(CONCURRENCY_LIMIT); // 需要安装 p-limit

// // 处理单个时间文件夹的异步函数
// const processTimeFolder = async (
//   deviceName: string,
//   timeNode: TreeNode
// ): Promise<UploadData | null> => {
//   const timeFolder = timeNode.title;
//   let contentFile: File | undefined;
//   const imageFiles: File[] = [];

//   // 并行处理文件发现
//   await Promise.all(
//     (timeNode.children || []).map(async (item) => {
//       if (item.title === "content.txt" && item.file) {
//         contentFile = item.file;
//       } else if (item.title === "imgs") {
//         imageFiles.push(
//           ...(item.children || [])
//             .filter((img) => img.file)
//             .map((img) => img.file!)
//         );
//       }
//     })
//   );

//   if (!contentFile) return null;

//   try {
//     // 并行处理文本内容和图片
//     const [contentText, processedFiles] = await Promise.all([
//       contentFile.text(),
//       Promise.all(
//         imageFiles.map((img) =>
//           limit(() =>
//             getBase64(img).then((data) => ({
//               filename: img.name,
//               data,
//             }))
//           )
//         )
//       ),
//     ]);

//     const { title, content } = parseContent(contentText);

//     return {
//       device_name: deviceName,
//       timestamp: convertTimeStringToTimestamp(timeFolder),
//       title,
//       content,
//       files: processedFiles,
//     };
//   } catch (error) {
//     console.error(`处理失败 ${deviceName}/${timeFolder}:`, error);
//     return null;
//   }
// };

// // 主处理函数
// export const processUploadedFiles = async (
//   treeData: TreeNode[]
// ): Promise<UploadData[]> => {
//   const globalStart = performance.now();

//   // 并行处理所有设备
//   const deviceResults = await Promise.all(
//     (treeData[0]?.children || []).map(async (deviceNode) => {
//       const deviceStart = performance.now();
//       const deviceName = deviceNode.title;

//       // 并行处理所有时间文件夹
//       const timeResults = await Promise.all(
//         (deviceNode.children || []).map((timeNode) =>
//           processTimeFolder(deviceName, timeNode)
//         )
//       );

//       console.log(
//         `🎉 完成设备 ${deviceName}，耗时: ${performance.now() - deviceStart}ms`
//       );
//       return timeResults.filter(Boolean) as UploadData[];
//     })
//   );

//   console.log(`🚀 总耗时: ${performance.now() - globalStart}ms`);
//   return deviceResults.flat();
// };
