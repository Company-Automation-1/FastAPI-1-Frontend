// 引入相应的文件
import React from "react";
// 引入路由
import * as Router from "react-router-dom";
// 引入Request
import Request from "@/services/request";
// 引入Cookie
import Cookie from "react-cookies";
// 引入Antd
import * as Antd from "antd";
import * as Icons from "@ant-design/icons";

// 在React命名空间定义相应属性
React.Router = Router;
React.Http = Request;
React.Cookies = Cookie;
React.A = Antd;
React.I = Icons;

// 不需要登录的路由地址
React.RouterRules = [];

export default {};
