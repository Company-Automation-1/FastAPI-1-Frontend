import React from "react";
import { Upload } from "antd";
import type { UploadFile, UploadProps } from "antd";
import { generateVideoThumbnail, getBase64 } from "@/utils/upload";

const { Dragger } = Upload;

interface ImgUploadProps {
  fileList: UploadFile[];
  onChange: (fileList: UploadFile[]) => void;
  onPreview: (file: UploadFile) => void;
  t: (key: string) => string;
}

const ImgUpload: React.FC<ImgUploadProps> = ({
  fileList,
  onPreview,
  onChange,
  t,
}) => {
  const props = React.useMemo<UploadProps>(
    () => ({
      name: "file",
      multiple: true, // 允许上传多个文件
      fileList,
      onPreview,
      beforeUpload: () => false, // 阻止自动上传
      listType: "picture-card", // 使用图片卡片样式
      onChange: ({ fileList: newFileList = [] }) => onChange?.(newFileList),
      previewFile: async (file) => {
        if (file instanceof Blob && file.type.startsWith("video/")) {
          return generateVideoThumbnail(file);
        }
        return getBase64(file as Blob);
      },
    }),
    [fileList, onChange]
  );

  return (
    <Dragger {...props}>
      <p className="ant-upload-drag-icon">
        <React.I.InboxOutlined />
      </p>
      <p className="ant-upload-text">
        {t("Click or drag file to this area to upload")}
      </p>
      <p className="ant-upload-hint">
        {t("Support for a single or bulk upload. Strictly prohibited from")}
        {t("uploading company data or other banned files")}
      </p>
    </Dragger>
  );
};

export default ImgUpload;
