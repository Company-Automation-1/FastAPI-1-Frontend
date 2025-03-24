import React from "react";
import "./index.scss";
import type { GetProp, UploadFile, UploadProps, FormProps } from "antd";
import { Form, DatePicker, Button } from "antd";
import {
  getBase64,
  generateVideoThumbnail,
  parseContent,
} from "@/utils/upload";
import { useTranslation } from "react-i18next";
import TextFileUploader from "@/views/index/components/TextUpload/TextUpload";
import dayjs from "dayjs";
import { uploadApi } from "@/api/index";
import utc from "dayjs/plugin/utc";
import ImgUpload from "./components/ImgUpload/index";
import Preview from "./components/Preview/index";
import DeviceSelect from "./components/DeviceSelect";

interface FormValues {
  timestamp: dayjs.Dayjs;
  device_name: string;
  text?: string;
  title?: string;
  content?: string;
  files: UploadFile[];
}

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

dayjs.extend(utc);

const Index: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState<string | undefined>(
    undefined
  );
  const [currentFile, setCurrentFile] = React.useState<UploadFile | null>(null);
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);

  const handleFileListChange = (newFileList: UploadFile[]) => {
    setFileList(newFileList);
    form.setFields([{ name: "files", value: newFileList }]);
  };

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
    setPreviewImage(file.url || (file.preview as string) || undefined);
    setPreviewOpen(true);
  }, []);

  const handleClose = React.useCallback(() => {
    setPreviewOpen(false);
    setCurrentFile(null);
    setPreviewImage(undefined);
  }, []);

  const onSubmit: FormProps<FormValues>["onFinish"] = async (values) => {
    const filesBase64 = await Promise.all(
      values.files.map(async (file) => {
        if (!file.originFileObj) return null;
        const base64 = await getBase64(file.originFileObj);
        return {
          filename: file.name,
          data: base64.split(",")[1],
        };
      })
    );

    const data = {
      ...values,
      timestamp: values.timestamp.utc().unix(),
      files: filesBase64.filter(
        (file): file is { filename: string; data: string } => file !== null
      ),
      ...(values.text ? parseContent(values.text) : {}),
    };
    delete data.text;

    try {
      const result = await uploadApi(data);
      if (result.code === 1) {
        form.resetFields();
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const config = {
    rules: [{ required: true, message: `${t("Please input")}!` }],
  };

  return (
    <>
      <Form
        form={form}
        name="forms"
        initialValues={{ remember: true, files: [] }}
        onFinish={onSubmit}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "90%",
          }}
        >
          <Form.Item label={t("Time")} name="timestamp" {...config}>
            <DatePicker showTime minDate={dayjs()} />
          </Form.Item>

          <Form.Item label={t("Phone")} name="device_name" {...config}>
            <DeviceSelect />
          </Form.Item>

          <Form.Item label={null}>
            <Button type="primary" htmlType="submit">
              {t("Submit")}
            </Button>
          </Form.Item>
        </div>

        <Form.Item
          label={t("Text")}
          style={{ marginLeft: 11 }}
          name="text"
          valuePropName="value"
          getValueFromEvent={(content: any) => content}
        >
          <TextFileUploader />
        </Form.Item>

        <Form.Item
          label={t("Images")}
          name="files"
          {...config}
          valuePropName="fileList"
          getValueFromEvent={(e: { fileList: any }) => e?.fileList || e}
        >
          <ImgUpload
            fileList={fileList}
            onChange={handleFileListChange}
            onPreview={handlePreview}
            t={t}
          />
        </Form.Item>
      </Form>

      <Preview
        previewOpen={previewOpen}
        previewImage={previewImage}
        currentFile={currentFile}
        onClose={handleClose}
      />
    </>
  );
};

export default Index;
