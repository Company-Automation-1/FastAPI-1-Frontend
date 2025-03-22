// i18next-parser.config.cjs
const path = require("path");

module.exports = {
  // 路径配置（跨平台兼容）
  input: [
    path.resolve(process.cwd(), "src/**/*.{js,jsx,ts,tsx}"), // 使用 path.resolve 而非 win32
    "!**/node_modules/**", // 排除 node_modules
  ],
  output: path.resolve(
    process.cwd(),
    "src/i18n/locales/$LOCALE/$NAMESPACE.json"
  ),

  // 国际化配置
  locales: ["en", "zh", "tw"], // 支持的语言
  defaultNamespace: "translation", // 默认命名空间
  namespaceSeparator: "~", // 命名空间分隔符（需与代码一致）
  keySeparator: "::", // 键分隔符（需与代码一致）

  // 提取逻辑
  func: {
    list: ["t", "i18next.t"], // 代码中使用的翻译函数名
    extensions: [".js", ".jsx", ".ts", ".tsx"], // 需要扫描的文件类型
  },

  // 默认值与兼容性
  defaultValue: "__NOT_TRANSLATED__", // 未翻译键的默认值
  skipDefaultValues: false, // 是否跳过默认值
  useKeysAsDefaultValue: false, // 是否将键名作为默认值

  // 其他选项
  contextSeparator: "_", // 上下文分隔符
  interpolation: {
    prefix: "{{", // 插值语法前缀
    suffix: "}}", // 插值语法后缀
  },
};
