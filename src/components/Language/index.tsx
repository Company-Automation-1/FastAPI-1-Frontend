import React from "react";

// 引入dayjs
import dayjs from "dayjs";

// 引入i18n
import { useTranslation } from "react-i18next";
import type { ConfigProviderProps, MenuProps } from "antd";

interface LanguageSwitcherProps {
  onChange: (locale: ConfigProviderProps["locale"]) => void;
  localeConfig: {
    [key: string]: {
      antd: ConfigProviderProps["locale"];
      dayjs: string;
      i18n: string;
      display: string;
    };
  };
}

dayjs.locale("en");

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  onChange,
  localeConfig,
}) => {
  const { i18n } = useTranslation();

  const getLocaleText = () =>
    localeConfig[i18n.language as keyof typeof localeConfig]?.display || "En";

  const handleMenuClick: MenuProps["onClick"] = async (e) => {
    const config = localeConfig[e.key as keyof typeof localeConfig];
    try {
      await i18n.changeLanguage(config.i18n);
      dayjs.locale(config.dayjs);
      onChange(config.antd);
    } catch (error) {
      console.error("Language change failed:", error);
    }
  };

  const selectedKey = i18n.language in localeConfig ? i18n.language : "en";

  const menuItems: MenuProps["items"] = Object.keys(localeConfig).map(
    (key) => ({
      key,
      label: localeConfig[key].display,
      style: { textAlign: "center", padding: "6px 9px" },
      type: "item", // 添加 type 属性以满足 ItemType 的要求
    })
  );

  return (
    <React.A.Dropdown
      menu={{
        onClick: handleMenuClick,
        selectedKeys: [selectedKey],
        items: menuItems,
      }}
    >
      <React.A.Button style={{ width: 40 }}>{getLocaleText()}</React.A.Button>
    </React.A.Dropdown>
  );
};

export default LanguageSwitcher;
