import React from "react";
import { useTranslation } from "react-i18next";
import type { UploadProps, TreeDataNode } from "antd";
import Tree from "./components/Tree";
import "./index.scss";
import { processUploadedFiles } from "../../utils/upload";

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

  const onSubmit = async () => {
    const processedData = await processUploadedFiles(treeData as any);
    console.log('解析后的数据结构：', processedData);

    // // 使用 map 遍历并打印每个子元素
    // treeData[0].children?.map((child, index) => {
    //   // console.log(`子元素 ${index}:`, child);
    //   if (child.children) {
    //     // 如果子元素有 children 属性，则继续遍历
    //     child.children.map((subChild, subIndex) => {
    //       // console.log(`子元素 ${index} 的子元素 ${subIndex}:`, subChild);
    //       if (subChild.children) {
    //         // 如果子元素有 children 属性，则继续遍历
    //         // console.log(`子元素:`, subChild.children[1]);
    //         if (subChild.children[1].children) {
    //           subChild.children[1].children.map((file) => {
    //             // console.log(`文件信息:`, file);
    //           });
    //         }
    //       }
    //     });
    //   }
    // });
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
