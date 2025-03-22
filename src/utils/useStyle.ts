// useStyle.ts
import { theme } from "antd";

export const useStyle = () => {
  const { token } = theme.useToken();

  return {
    styles: {
      colorText: token.colorText,
      colorBorder: token.colorBorder,
      colorPrimary: token.colorPrimary,
      previewBg: token.colorBgContainer,
      previewBorder: token.colorBorder,
      previewTitleColor: token.colorTextHeading,
      previewTextColor: token.colorText,
      scrollbarTrack: token.colorBgContainerDisabled,
      scrollbarThumb: token.colorPrimary,
      emptyStateColor: token.colorTextDescription,
      fontFamily: token.fontFamily,
    },
  };
};
