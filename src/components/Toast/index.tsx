import React from 'react';

const Toast: React.FC = () => {

  const [messageApi, contextHolder] = React.A.message.useMessage();

  // 成功和失败提醒方法
  const toast = (msg: string, type?: string, callback?: any) => {
      messageApi.open({
          type: type ? type : 'success',
          content: msg,
          duration: 1.5,
          onClose: () => {
              if(!callback) return;
  
              if(typeof callback === "string") {
                  callback === "back" ? React.navigate(-1) : React.navigate(callback)
              } else {
                  callback();
              }
          }
      });
  }

  // 将 toast 方法挂载到 React 全局
  React.toast = toast;

  return (
    <>
      {contextHolder}
    </>
  );
};

export default Toast;