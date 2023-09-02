export type TFormattedLog = {
  formattedLevel: string;
  formattedMessage: string;
  formattedContext: string;
  formattedTimestamp: string;
  formattedPID: string;
};

export type TFormattedTrace = {
  invokedFunction?: string;
  fileName?: string;
  filePath?: string;
};
