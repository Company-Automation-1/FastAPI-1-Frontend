import React from "react";
import { useTranslation } from "react-i18next";
import type { UploadProps, TreeDataNode } from "antd";
import Tree from "./components/Tree";
import "./index.scss";
import { processUploadedFiles } from "@/utils/upload";
import { uploadApi } from "@/api";

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
    console.log("解析后的数据结构：", processedData);

    console.log(treeData);

    // 定义批次大小
    const BATCH_SIZE = 3;
    // 分批处理数据
    const batches = [];
    for (let i = 0; i < processedData.length; i += BATCH_SIZE) {
      batches.push(processedData.slice(i, i + BATCH_SIZE));
    }

    try {
      // 显示加载状态
      React.A.message.loading("正在上传...", 0);

      // 按批次并发处理
      for (const batch of batches) {
        const results = await Promise.all(
          batch.map(async (data) => {
            try {
              return await uploadApi(data);
            } catch (error) {
              console.error("上传失败:", error);
              return { error, data };
            }
          })
        );

        // 处理每个批次的结果
        results.forEach((result: any, index: number) => {
          if (result.error) {
            React.A.message.error(`${batch[index].device_name} 上传失败`);
          }
        });
      }

      React.A.message.destroy(); // 清除加载提示
      React.A.message.success("上传完成");
    } catch (error) {
      React.A.message.destroy();
      React.A.message.error("上传过程中发生错误");
      console.error("上传错误:", error);
    }
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
