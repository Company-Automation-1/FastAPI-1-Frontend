/// <reference types="vite/client" />
/// <reference types="vite-plugin-pages/client-react" />

// Typescript 声明
declare global {
  // 给React命名空间去扩展自定义的属性声明
  namespace React {
    let Router: Module;
    let navigate: function;
    let Http: Module;
    let Cookies: Module;
    let RouterRules: Array;
    let A: Module;
    let I: Module;
    let toast: Function;
  }
}

declare namespace React {
  let Router: Module;
  let navigate: function;
  let Http: Module;
  let Cookies: Module;
  let RouterRules: Array;
  let A: Module;
  let I: Module;
  let toast: Function;
}
