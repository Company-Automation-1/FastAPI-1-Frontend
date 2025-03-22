import React from "react";

// 引入 react-router-dom 中的路由相关 API
import { BrowserRouter, useRoutes } from "react-router-dom";

// 获取所有的页面路由
// ~react-pages 是一个约定俗成的路径，通常表示自动生成的路由配置文件
import routes from "~react-pages";

import type { ConfigProviderProps } from "antd";

import LanguageSwitcher from "./components/Language";
// Ant Design 多语言包
import enUS from "antd/locale/en_US";
import zhCN from "antd/locale/zh_CN";
import zhTW from "antd/locale/zh_TW";

// 类型定义
type Locale = ConfigProviderProps["locale"];

const localeConfig = {
  en: {
    antd: enUS,
    dayjs: "en",
    i18n: "en",
    display: "En",
  },
  zh_cn: {
    antd: zhCN,
    dayjs: "zh-cn",
    i18n: "zh_cn",
    display: "简",
  },
  zh_tw: {
    antd: zhTW,
    dayjs: "zh-tw",
    i18n: "zh_tw",
    display: "繁",
  },
};

// 路由 组件
const Routers = () => {
  // 使用 useNavigate 钩子获取导航函数，并将其赋值给 React.navigate
  // 这样可以在应用的任何地方通过 React.navigate 进行页面跳转
  let navigate = useNavigate();
  React.navigate = navigate;

  return (
    <>
      {/* 使用 React.Suspense 包裹路由组件，实现懒加载 */}
      <React.Suspense>
        {/* 使用 useRoutes 钩子根据 routes 配置生成路由列表 */}
        {useRoutes(routes)}
      </React.Suspense>
    </>
  );
};

const App = () => {
  const [locale, setLocale] = useState<Locale>(enUS);
  return (
    <>
      {/* /使用 BrowserRouter 包裹整个应用，启用路由功能 */}
      <BrowserRouter>
        <React.A.ConfigProvider
          locale={locale}
          theme={{
            components: {
              Button: {
                borderRadius: 8,
                colorPrimaryHover: "#40a9ff",
              },
            },
          }}
        >
          <div
            style={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 1000,
            }}
          >
            {/* 语言切换器 */}
            <LanguageSwitcher
              onChange={setLocale}
              localeConfig={localeConfig}
            />
          </div>
          {/* 渲染 Routers 组件，显示路由内容 */}
          <Routers />
        </React.A.ConfigProvider>
      </BrowserRouter>
    </>
  );
};

export default App;
