import React from "react";
import "./index.scss";
import type { GetProp, UploadFile, UploadProps, FormProps } from "antd";
import { Upload } from "antd";
import {
  getBase64,
  generateVideoThumbnail,
  parseContent,
} from "@/utils/upload";
import { useTranslation } from "react-i18next";
import TextFileUploader from "@/components/TextUoloader/TextUoloader";
import dayjs from "dayjs";

// 定义表单字段类型
interface FormValues {
  time: dayjs.Dayjs; // 时间字段，使用dayjs类型
  text?: string; // 可选文本字段
  title: string; // 标题字段
  content: string; // 内容字段
  fileList: UploadFile[]; // 文件列表，用于存储上传的文件
}

// 定义文件类型，用于上传组件
type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];
const { Dragger } = Upload; // 解构出Dragger组件用于拖拽上传

const Index: React.FC = () => {
  const { t } = useTranslation(); // 国际化翻译hook
  const [previewOpen, setPreviewOpen] = React.useState(false); // 控制预览窗口是否打开
  const [previewImage, setPreviewImage] = React.useState<string | null>(null); // 预览图片的URL
  const [currentFile, setCurrentFile] = React.useState<UploadFile | null>(null); // 当前预览的文件
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null); // 视频预览的URL
  const [fileList, setFileList] = React.useState<UploadFile[]>([]); // 上传文件列表

  // 处理文件预览逻辑
  const handlePreview = React.useCallback(async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      const originFile = file.originFileObj as FileType;
      try {
        // 根据文件类型生成预览：视频生成缩略图，图片生成base64
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

  // 清理视频URL的副作用
  React.useEffect(() => {
    if (currentFile?.originFileObj?.type.startsWith("video/")) {
      const url = URL.createObjectURL(currentFile.originFileObj);
      setVideoUrl(url);
      return () => {
        URL.revokeObjectURL(url); // 组件卸载时释放URL对象
        setVideoUrl(null);
      };
    }
  }, [currentFile]);

  // 关闭预览窗口
  const handleClose = React.useCallback(() => {
    setPreviewOpen(false);
    setCurrentFile(null);
    setPreviewImage(null);
  }, []);

  // 上传组件的配置项
  const props = React.useMemo<UploadProps>(
    () => ({
      name: "file",
      multiple: true, // 允许上传多个文件
      fileList,
      onPreview: handlePreview,
      beforeUpload: () => false, // 阻止自动上传
      listType: "picture-card", // 使用图片卡片样式
      onChange: ({ fileList: newFileList = [] }) => {
        setFileList(newFileList); // 更新文件列表
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

  // 表单提交处理函数
  const onFinish: FormProps<FormValues>["onFinish"] = (values) => {
    const transformedValues = {
      ...values,
      time: values.time.unix(), // 将时间转换为unix时间戳
      ...(values.text ? parseContent(values.text) : {}), // 解析文本内容
    };
    delete transformedValues.text;

    console.log("API请求逻辑:", transformedValues);
  };

  // 表单验证配置
  const config = {
    rules: [
      {
        required: true,
        message: `${t("Please input")}!`, // 使用国际化文本
      },
    ],
  };

  return (
    <>
      <React.A.Form
        name="forms"
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        {/* 时间选择器部分 */}
        <div style={{ display: "flex" }}>
          <React.A.Form.Item label={`${t("Time")}`} name="time" {...config}>
            <React.A.DatePicker showTime />
          </React.A.Form.Item>

          {/* 提交按钮 */}
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

        {/* 文本上传组件 */}
        <React.A.Form.Item
          label={`${t("Text")}`}
          name="text"
          {...config}
          valuePropName="value"
          getValueFromEvent={(content: any) => content}
        >
          <TextFileUploader />
        </React.A.Form.Item>

        {/* 图片上传组件 */}
        <React.A.Form.Item
          label={`${t("Images")}`}
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
              {t("uploading company data or other banned files")}
            </p>
          </Dragger>
        </React.A.Form.Item>
      </React.A.Form>

      {/* 图片/视频预览组件 */}
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
          toolbarRender: () => null, // 隐藏工具栏
          destroyOnClose: true, // 关闭时销毁组件
        }}
        src={previewImage}
      />
    </>
  );
};

export default Index;
