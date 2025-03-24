// TextFileUpload.tsx
import React from "react";
import type { UploadProps } from "antd";
import { Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useStyle } from "@/utils/useStyle"; // 自定义样式Hook
import styles from "./TextUpload.module.scss";

const { Dragger } = Upload;

export interface TextFileUploaderHandle {
  getContent: () => string;
  getFile: () => File | null;
}

interface TextFileUploaderProps {
  onContentChange?: (content: string) => void;
  onFileChange?: (file: File | null) => void;
  onChange?: (content: string) => void;
}

const TextFileUploader = forwardRef<
  TextFileUploaderHandle,
  TextFileUploaderProps
>(({ onContentChange, onFileChange, onChange }, ref) => {
  const { t } = useTranslation();
  const [content, setContent] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const { styles: customStyles } = useStyle();

  useImperativeHandle(ref, () => ({
    getContent: () => content,
    getFile: () => file,
  }));

  const props: UploadProps = {
    name: "file",
    accept: ".txt,.md,.doc,.docx",
    multiple: false,
    maxCount: 1,
    beforeUpload: () => false,
    showUploadList: false,
    onChange(info) {
      const [fileItem] = info.fileList || [];
      if (!fileItem?.originFileObj) {
        setFile(null);
        onFileChange?.(null);
        onChange?.("");
        return;
      }

      const newFile = fileItem.originFileObj;
      setFile(newFile);
      onFileChange?.(newFile);

      const reader = new FileReader();
      reader.onload = () => {
        const newContent = reader.result?.toString() || "";
        setContent(newContent);
        onContentChange?.(newContent); // 业务层关心的原始数据
        onChange?.(newContent); // 表单系统需要的标准化数据
      };
      reader.onerror = () => {
        setContent("");
        onContentChange?.("");
      };
      reader.readAsText(newFile);
    },
  };

  return (
    <React.A.ConfigProvider
      theme={{
        components: {
          Upload: {
            colorText: customStyles.colorText,
            colorBorder: customStyles.colorBorder,
            colorPrimary: customStyles.colorPrimary,
          },
        },
      }}
    >
      <div className={styles.uploadContainer}>
        <div className={styles.uploadArea}>
          <Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              {t("Click or drag file to this area to upload")}
            </p>
            <p className="ant-upload-hint">
              {t("Support for text formats")}: .txt, .md, .doc, .docx
            </p>
          </Dragger>
        </div>

        <div
          className={styles.previewWrapper}
          style={{
            backgroundColor: customStyles.previewBg,
            border: `1px solid ${customStyles.previewBorder}`,
          }}
        >
          {content ? (
            <pre
              className={styles.previewContent}
              style={{
                color: customStyles.previewTextColor,
                fontFamily: customStyles.fontFamily,
              }}
            >
              {content}
            </pre>
          ) : (
            <div
              className={styles.emptyState}
              style={{ color: customStyles.emptyStateColor }}
            >
              {t("No file content to display")}
            </div>
          )}
        </div>
      </div>
    </React.A.ConfigProvider>
  );
});

export default TextFileUploader;
