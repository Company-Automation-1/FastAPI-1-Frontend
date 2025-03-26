// src/api/index.ts
import React from "react";
export const uploadApi = async (values: {
  timestamp: number; // 时间字段，使用dayjs类型
  device_name: string; // 设备名称
  title?: string; // 标题字段
  content?: string; // 内容字段
  files: {
    // 文件数组，包含文件名和Base64数据
    filename: string;
    data: string;
  }[];
}) => {
  // 打印完整的请求报文
  console.log(values);
  const result = await React.Http.post("/api/v1/upload/", values);
  return result;
};

export const devicesApi = async () =>
  await React.Http.get("/api/v1/devices/list/");
