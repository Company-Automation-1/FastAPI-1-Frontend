import axios from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// 定义一个自定义的泛类型结构 T是一个模糊的类型 在给这个结构赋值的时候就能够确定T是什么类型的
type Result<T> = {
  code: number;
  message: string;
  result: T;
};

// 导出Request类，可以用来自定义传递配置来创建实例
export class Request {
  // axios 实例
  instance: AxiosInstance;
  // 基础配置，url和超时时间
  baseConfig: AxiosRequestConfig = {
    // baseURL: "/api", // 请求后台地址模块
    timeout: 60000,
    headers: {
      // 设置后端需要的传参类型
      // 'Content-Type': 'application/json',
      "X-Requested-With": "XMLHttpRequest",
    },
  };

  constructor(config: AxiosRequestConfig) {
    // 使用axios.create创建axios实例
    this.instance = axios.create(Object.assign(this.baseConfig, config));

    //请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // 一般会请求拦截里面加token，用于后端的验证
        const token = localStorage.getItem("token") as string;
        if (token) {
          config.headers!.Authorization = token;
        }

        // 在发送请求之前做些什么
        return config;
      },
      (err: any) => {
        // 对请求错误做些什么，这里可以用全局提示框进行提示
        console.log(err);
        return Promise.reject(err);
      }
    );

    // 返回结果的相应拦截器
    this.instance.interceptors.response.use(
      (res: AxiosResponse) => {
        // 对响应数据做点什么
        // 直接返回res，当然你也可以只返回res.data
        // 系统如果有自定义code也可以在这里处理

        // const dataAxios = res.data;
        // const { code, message } = dataAxios;
        // element plus 可以使用 ElMessage
        // switch (code + "") {
        //   case "100":
        //     // 表示给用户一些提示
        //     ElNotification({
        //       offset: 60,
        //       title: "温馨提示",
        //       message: h("div", { style: "color: #e6c081; font-weight: 600;" }, message),
        //     });
        //     break;
        // }

        return res.data;
      },
      (err: any) => {
        // 这里用来处理http常见错误，进行全局提示
        let message = "";
        switch (err.response.status) {
          case 400:
            message = "请求错误(400)";
            break;
          case 401:
            message = "未授权，请重新登录(401)";
            // 这里可以做清空storage并跳转到登录页的操作
            break;
          case 403:
            message = "拒绝访问(403)";
            break;
          case 404:
            message = "请求出错(404)";
            break;
          case 408:
            message = "请求超时(408)";
            break;
          case 500:
            message = "服务器错误(500)";
            break;
          case 501:
            message = "服务未实现(501)";
            break;
          case 502:
            message = "网络错误(502)";
            break;
          case 503:
            message = "服务不可用(503)";
            break;
          case 504:
            message = "网络超时(504)";
            break;
          case 505:
            message = "HTTP版本不受支持(505)";
            break;
          default:
            message = `连接出错(${err.response.status})!`;
        }
        // 这里错误消息可以使用全局弹框展示出来
        // 比如element plus 可以使用 ElMessage
        // ElMessage({
        //   showClose: true,
        //   message: `${message}，请检查网络或联系管理员！`,
        //   type: "error",
        // });
        // 这里是AxiosError类型，所以一般我们只reject我们需要的响应即可
        // return Promise.reject(err.response);
        return Promise.reject(message);
      }
    );
  }

  // 定义请求方法
  public request(config: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.instance.request(config);
  }

  public get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<Result<T>>> {
    return this.instance.get(url, config);
  }

  // post('/business/login',{})
  public post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<Result<T>>> {
    return this.instance.post(url, data, config);
  }

  public upload<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<Result<T>>> {
    // 封装表单数据对象
    let RequestData = new FormData();

    if (JSON.stringify(data) != "{}") {
      for (let key in data) {
        RequestData.append(key, data[key]);
      }
    }

    // 请求头
    config = {
      headers: { "Content-Type": "multipart/form-data" },
    };

    return this.instance.post(url, RequestData, config);
  }

  public put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<Result<T>>> {
    return this.instance.put(url, data, config);
  }

  public delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<Result<T>>> {
    return this.instance.delete(url, config);
  }
}

// 默认导出Request实例
export default new Request({});
