export const sendToExtension = <T>(message): Promise<T> => {
  return new Promise((resolve, reject) => {
    const handler =
      response => {
        if (response && response.error) {
          reject(response.error);
        }
        else {
          resolve(response);
        }
      };

    try {
      chrome.runtime.sendMessage(message, handler);
    }
    catch (error) {
      reject(new Error(`Failed to send message to runtime: ${error.stack}`));
    }
  });
};
