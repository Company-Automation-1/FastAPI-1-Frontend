// src/api/user.ts
import React from "react";

// 登录验证
export const checkApi = async (values: {
  id: number;
}) => {
  const result = await React.Http.post("", values);
  return result;
};