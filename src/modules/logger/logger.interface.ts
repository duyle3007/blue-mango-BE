export interface ILoggerConfiguration {
  timestamp?: boolean;
  timestampPattern?: string;
  pid?: boolean;
  colorize?: boolean;
  multiline?: boolean;
  showHidden?: boolean;
  depth?: number | boolean;
  showData?: boolean;
  level?: number;
}
