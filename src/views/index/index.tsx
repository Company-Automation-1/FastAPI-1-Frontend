import React from "react";
import "./index.css";
import type { GetProp, UploadFile, UploadProps, FormProps } from "antd";
import { Upload } from "antd";
import { getBase64, generateVideoThumbnail } from "@/utils/upload";
import { useTranslation } from "react-i18next";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];
type FieldType = {
  [key: string]: any;
};

const { Dragger } = Upload;

const Index: React.FC = () => {
  const { t } = useTranslation();
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [currentFile, setCurrentFile] = React.useState<UploadFile | null>(null);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);

  // 处理预览（使用useCallback优化）
  const handlePreview = React.useCallback(async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      const originFile = file.originFileObj as FileType;
      try {
        file.preview = originFile?.type.startsWith("video/")
          ? await generateVideoThumbnail(originFile)
          : await getBase64(originFile);
      } catch (error) {
        console.error("Preview generation failed:", error);
      }
    }

    setCurrentFile(file);
    setPreviewImage(file.url || (file.preview as string) || null);
    setPreviewOpen(true);
  }, []);

  // 清理视频URL
  React.useEffect(() => {
    if (currentFile?.originFileObj?.type.startsWith("video/")) {
      const url = URL.createObjectURL(currentFile.originFileObj);
      setVideoUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setVideoUrl(null);
      };
    }
  }, [currentFile]);

  const handleClose = React.useCallback(() => {
    setPreviewOpen(false);
    setCurrentFile(null);
    setPreviewImage(null);
  }, []);

  // 使用useMemo优化上传配置
  const props = React.useMemo<UploadProps>(
    () => ({
      name: "file",
      multiple: true,
      fileList,
      onPreview: handlePreview,
      beforeUpload: () => false,
      listType: "picture-card",
      onChange: ({ fileList: newFileList = [] }) => {
        setFileList(newFileList);
      },
      previewFile: async (file: FileType | Blob) => {
        if (file instanceof Blob && file.type.startsWith("video/")) {
          return generateVideoThumbnail(file);
        }
        return getBase64(file as Blob);
      },
    }),
    [fileList, handlePreview]
  );

  const onFinish: FormProps<FieldType>["onFinish"] = (fieldsValue) => {
    const transformedValues = {
      ...fieldsValue,
      time: fieldsValue.time?.unix(),
      file: fileList,
    };
    console.log("Success:", transformedValues);
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

  const config = {
    rules: [
      {
        required: true,
        message: "Please input!",
      },
    ],
  };

  return (
    <>
      <h1>{t("English")}</h1>
      <React.A.Form
        name="forms"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <div style={{ display: "flex" }}>
          <React.A.Form.Item label={`${t("Time")}`} name="time" {...config}>
            <React.A.DatePicker showTime />
          </React.A.Form.Item>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexGrow: 1,
            }}
          >
            <React.A.Form.Item label={null}>
              <React.A.Button type="primary" htmlType="submit">
                {t("Submit")}
              </React.A.Button>
            </React.A.Form.Item>
          </div>
        </div>

        <React.A.Form.Item
          label={`${t("File")}`}
          name="file"
          {...config}
          valuePropName="fileList"
          getValueFromEvent={(e: { fileList: any }) => e.fileList}
        >
          <Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <React.I.InboxOutlined />
            </p>
            <p className="ant-upload-text">
              {t("Click or drag file to this area to upload")}
            </p>
            <p className="ant-upload-hint">
              {t(
                "Support for a single or bulk upload. Strictly prohibited from"
              )}
              {t("uploading company data or other banned files")}.
            </p>
          </Dragger>
        </React.A.Form.Item>
      </React.A.Form>

      <React.A.Image
        wrapperStyle={{ display: "none" }}
        preview={{
          visible: previewOpen,
          onVisibleChange: (visible: boolean) => !visible && handleClose(),
          imageRender: () => (
            <div style={{ display: "flex", justifyContent: "center" }}>
              {videoUrl ? (
                <video
                  controls
                  autoPlay
                  style={{ maxWidth: "100%", maxHeight: "80vh" }}
                  src={videoUrl}
                />
              ) : (
                <img
                  style={{ maxWidth: "100%", maxHeight: "80vh" }}
                  src={previewImage || undefined}
                  alt="preview"
                />
              )}
            </div>
          ),
          toolbarRender: () => null,
          destroyOnClose: true,
        }}
        src={previewImage}
      />
    </>
  );
};

export default Index;
