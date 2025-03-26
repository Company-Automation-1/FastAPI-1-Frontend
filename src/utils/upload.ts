// utils/upload.ts

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

// 初始化 dayjs utc 插件
dayjs.extend(utc);

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

// 文本截取
export const parseContent = (raw: string) => {
  if (!raw) return {};
  
  // 支持多种标题格式：
  // - 标题：xxx 或 Title: xxx
  // - "标题"：xxx 或 "Title": xxx
  // - 「标题」：xxx
  // - # xxx
  const titlePattern = /^(?:(?:["「]?(?:标题|Title)["」]?[：:]\s*)|#\s*)(.*)$/m;
  const titleMatch = raw.match(titlePattern);
  const title = titleMatch?.[1]?.trim() || "";

  // 支持多种正文格式：
  // - 正文：xxx 或 Content: xxx
  // - "正文"：xxx 或 "Content": xxx
  // - 「正文」：xxx
  const contentPattern = /(?:["「]?(?:正文|Content)["」]?[：:]\s*)([\s\S]*)/;
  const contentMatch = raw.match(contentPattern);
  const content = contentMatch?.[1]?.trim() || "";

  return { title, content };
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
  return dayjs.utc(timeString, 'YYYYMMDDHHmmss').unix();
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
export const processUploadedFiles = async (treeData: TreeNode[]): Promise<UploadData[]> => {
  const results: UploadData[] = [];

  // 处理设备文件夹
  for (const deviceNode of treeData[0]?.children || []) {
    const deviceName = deviceNode.title;
    
    // 处理时间文件夹
    for (const timeNode of deviceNode.children || []) {
      const timeFolder = timeNode.title;
      let contentFile: File | undefined;
      const imageFiles: File[] = [];

      // 处理 imgs 文件夹和 content.txt
      for (const item of timeNode.children || []) {
        if (item.title === 'content.txt' && item.file) {
          contentFile = item.file;
        } else if (item.title === 'imgs') {
          // 收集图片文件
          for (const imgNode of item.children || []) {
            if (imgNode.file) {
              imageFiles.push(imgNode.file);
            }
          }
        }
      }

      if (contentFile) {
        try {
          const contentText = await contentFile.text();
          const { title, content } = parseContent(contentText);
          
          const processedFiles = await Promise.all(
            imageFiles.map(async (file) => ({
              filename: file.name,
              data: await getBase64(file)
            }))
          );
          
          results.push({
            device_name: deviceName,
            timestamp: convertTimeStringToTimestamp(timeFolder),
            title,
            content,
            files: processedFiles
          });
        } catch (error) {
          console.error('处理文件失败:', error, contentFile);
        }
      }
    }
  }
  
  return results;
};