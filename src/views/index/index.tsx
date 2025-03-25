import React from "react";
import "./index.scss";
import type { GetProp, UploadFile, UploadProps, FormProps } from "antd";
import { Form } from "antd";
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
        console.log(result);
        
        form.resetFields();
        React.toast(result.msg, 'success');
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
    {/* <React.A.Button onClick={() => React.toast('1111','error' )}>1111</React.A.Button> */}
      <React.A.Form
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
          <React.A.Form.Item label={t("Time")} name="timestamp" {...config}>
            <React.A.DatePicker showTime minDate={dayjs()} />
          </React.A.Form.Item>

          <React.A.Form.Item label={t("Phone")} name="device_name" {...config}>
            <DeviceSelect />
          </React.A.Form.Item>

          <React.A.Form.Item label={null}>
            <React.A.Button type="primary" htmlType="submit">
              {t("Submit")}
            </React.A.Button>
          </React.A.Form.Item>
        </div>

        <React.A.Form.Item
          label={t("Text")}
          style={{ marginLeft: 11 }}
          name="text"
          valuePropName="value"
          getValueFromEvent={(content: any) => content}
        >
          <TextFileUploader />
        </React.A.Form.Item>

        <React.A.Form.Item
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
        </React.A.Form.Item>
      </React.A.Form>

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
