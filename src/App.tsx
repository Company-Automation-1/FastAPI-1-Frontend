import React from "react";

// 引入 react-router-dom 中的路由相关 API
import { BrowserRouter, useRoutes } from "react-router-dom";

// 获取所有的页面路由
// ~react-pages 是一个约定俗成的路径，通常表示自动生成的路由配置文件
import routes from "~react-pages";

const Routers = () => {
  // 使用 useNavigate 钩子获取导航函数，并将其赋值给 React.navigate
  // 这样可以在应用的任何地方通过 React.navigate 进行页面跳转
  let navigate = useNavigate();
  React.navigate = navigate;

  // // 状态变量
  // const [key] = useState<KeyType>({
  //     id: 0,
  // });

  // // 获取当前路径
  // const { pathname } = useLocation();

  // useEffect(() => {
  //     // 登录验证函数
  //     const Check = async (key: KeyType) => {
  //         // 获取cookies (用户信息)
  //         let user = await checkApi(key);

  //         // 提取对象属性名，以数组返回，判断数组长度是否为0
  //         if (Object.getOwnPropertyNames(user).length === 0) {
  //             // replace 路由跳转
  //             React.navigate("", { replace: true });

  //             // 提示信息
  //             console.log("🚀 ~ Check ~ 提示信息:", "请先登录");

  //             // return false;
  //             return true
  //         }

  //         // 获取用户id和手机号并赋值
  //         key.id = user.id ?? 0;

  //         // 发起请求
  //         let result = await await React.Http.post(key);

  //         if (result.code === 1) {
  //             // 重新更新用户信息
  //             React.Cookies.save("user", result.data, { path: "/" });

  //             return true;
  //         } else {
  //             // { replace: true } 替换而不是加入一个新的历史记录
  //             React.navigate("/user/login", { replace: true });

  //             return false;
  //         }
  //     };

  //     // 2. 检查当前路径是否在路由规则中
  //     if (!React.RouterRules.includes(pathname)) Check(key);
  // }, [pathname, navigate, key]);

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
  return (
    <>
      {/* /使用 BrowserRouter 包裹整个应用，启用路由功能 */}
      <BrowserRouter>
        {/* 渲染 Routers 组件，显示路由内容 */}
        <Routers />
      </BrowserRouter>
    </>
  );
};

export default App;
