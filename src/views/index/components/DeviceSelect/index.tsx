import React from "react";
import type { SelectProps } from "antd";
import { devicesApi } from "@/api/index";

interface DeviceOption {
  label: string;
  value: string;
}

type DeviceSelectProps = Omit<SelectProps, "options">;

const DeviceSelect: React.FC<DeviceSelectProps> = (props) => {
  const [devices, setDevices] = useState<DeviceOption[]>([]);

  const getDevices = async () => {
    try {
      const result = await devicesApi();
      if (result.code === 1) {
        // 转换数据格式以匹配 Select 组件要求
        const options = result.data.devices.map((device: string) => ({
          label: device,
          value: device,
        }));
        setDevices(options);
      }
    } catch (error) {
      console.error("Failed to fetch devices:", error);
    }
  };

  useEffect(() => {
    getDevices();
  }, []);

  return (
    <React.A.Select
      style={{ width: 200 }}
      allowClear
      options={devices}
      placeholder="select"
      {...props}
    />
  );
};

export default DeviceSelect;
