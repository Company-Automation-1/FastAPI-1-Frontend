import React from "react";
import { Image } from "antd";
import type { UploadFile } from "antd";

interface PreviewProps {
  previewOpen: boolean;
  previewImage: string | undefined;
  currentFile: UploadFile | null;
  onClose: () => void;
}

const Preview: React.FC<PreviewProps> = ({
  previewOpen,
  previewImage,
  currentFile,
  onClose,
}) => {
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);

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

  return (
    <>
      <Image
        wrapperStyle={{ display: "none" }}
        preview={{
          visible: previewOpen,
          onVisibleChange: (visible) => !visible && onClose(),
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

export default Preview;
