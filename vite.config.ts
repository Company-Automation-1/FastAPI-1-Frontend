import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 引入自动引入HOOK
import AutoImport from "unplugin-auto-import/vite";

// node 的 TypeScript 定义
import { fileURLToPath, URL } from "node:url";

// 引入自动生成路由
import Pages from "vite-plugin-pages";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    AutoImport({
      // 自动导入相关API
      imports: ["react", "react-router-dom"],
      // 生成全局自动引入配置文件
      dts: "./src/auto-imports.d.ts",
    }),
    Pages({
      dirs: "src/views", // 需要生成路由的组件目录
      exclude: ["**/components/*.tsx"], // 排除在外的目录，即所有 components 目录下的 .tsx 文件都不会生成路由
    }),
  ],
  // 配置别名
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true, // 支持内联 JavaScript
        modifyVars: {
          // 更改主题
        },
      },
    },
  },
  server: {
    //开发服务器的配置
    //反向代理
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000/", //反向代理的目标地址
        // target: 'http://hotel.hly.galen.asia/hotel', //反向代理的目标地址
        changeOrigin: true, //允许跨域
        //替换掉api前缀 防止多个api地址
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
