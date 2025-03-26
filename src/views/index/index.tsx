import React from "react";
import { useTranslation } from "react-i18next";
import type { UploadProps, TreeDataNode } from "antd";
import Tree from "./components/Tree";
import "./index.scss";

const Index: React.FC = () => {
  const { t } = useTranslation();
  const [form] = React.A.Form.useForm();
  const [fileList, setFileList] = React.useState<File[]>([]);
  const [treeData, setTreeData] = React.useState<TreeDataNode[]>([]);

  const props: UploadProps = {
    name: "file",
    multiple: true,
    directory: true,
    showUploadList: false,
    beforeUpload: () => false,
  };

  const onSubmit = (values: any) => {
    console.log("Submit:", values, treeData);
  };

  const handleReset = () => {
    form.resetFields();
    setFileList([]);
    setTreeData([]);
  };

  const handleUpload = (e: any) => {
    // 清空之前的记录
    setFileList([]);
    setTreeData([]);

    // 处理新的文件列表
    const files = (e?.fileList || []).map((item: any) => item.originFileObj);
    setFileList(files);
    return e.fileList;
  };

  return (
    <>
      <React.A.Form form={form} onFinish={onSubmit}>
        <React.A.Form.Item>
          <React.A.Space>
            <React.A.Button type="primary" htmlType="submit">
              {t("Submit")}
            </React.A.Button>
            <React.A.Button htmlType="button" onClick={handleReset}>
              {t("Reset")}
            </React.A.Button>
          </React.A.Space>
        </React.A.Form.Item>

        <React.A.Form.Item
          label={t("Upload")}
          name="upload"
          valuePropName="fileList"
          getValueFromEvent={handleUpload}
          noStyle
        >
          <React.A.Upload.Dragger {...props}>
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
          </React.A.Upload.Dragger>
        </React.A.Form.Item>

        <div className="tree-container">
          <Tree fileList={fileList} onTreeDataChange={setTreeData} />
        </div>
      </React.A.Form>
    </>
  );
};

export default Index;
