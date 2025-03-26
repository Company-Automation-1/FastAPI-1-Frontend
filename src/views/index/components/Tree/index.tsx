import React from "react";
import { Tree } from "antd";
import type { GetProps, TreeDataNode } from "antd";

type DirectoryTreeProps = GetProps<typeof Tree.DirectoryTree>;

interface FileNode {
  title: string;
  key: string;
  isDir: boolean;
  children?: FileNode[];
  file?: File;
}

const { DirectoryTree } = Tree;

interface TreeComponentProps {
  fileList?: File[];
  onTreeDataChange?: (treeData: TreeDataNode[]) => void;
}

const Index: React.FC<TreeComponentProps> = ({ 
  fileList = [], 
  onTreeDataChange 
}) => {
  const buildFileTree = (files: File[]): TreeDataNode[] => {
    const root: FileNode = { title: "", key: "", isDir: true, children: [] };

    files.forEach((file) => {
      const path = (file as any).webkitRelativePath || file.name;
      const parts = path.split("/");
      let current = root;

      parts.forEach((part: string, index: number) => {
        const isLast = index === parts.length - 1;
        const existing = current.children?.find(
          (child) => child.title === part
        );

        if (existing) {
          current = existing;
        } else {
          const newNode: FileNode = {
            title: part,
            key: path + "-" + index,
            isDir: !isLast,
            children: [],
          };

          if (isLast) {
            newNode.file = file;
            delete newNode.children;
          }

          current.children?.push(newNode);
          current = newNode;
        }
      });
    });

    return root.children || [];
  };

  const onSelect: DirectoryTreeProps["onSelect"] = (keys, info) => {
    console.log("Trigger Select", keys, info);
  };

  const onExpand: DirectoryTreeProps["onExpand"] = (keys, info) => {
    console.log("Trigger Expand", keys, info);
  };

  const treeData = buildFileTree(fileList);

  React.useEffect(() => {
    const newTreeData = buildFileTree(fileList);
    onTreeDataChange?.(newTreeData);
  }, [fileList, onTreeDataChange]);

  return (
    <DirectoryTree
      multiple
      // draggable
      defaultExpandAll
      onSelect={onSelect}
      onExpand={onExpand}
      treeData={treeData}
    />
  );
};

export default Index;
