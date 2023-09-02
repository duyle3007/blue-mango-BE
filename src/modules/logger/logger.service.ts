import { LoggerService } from '@nestjs/common';
import { parse, ParsedPath } from 'path';
import { inspect } from 'util';
import { ILoggerConfiguration } from './logger.interface';
import { TFormattedLog, TFormattedTrace } from './logger.type';

export class Logger implements LoggerService {
  private static instance: Logger;
  protected static config: ILoggerConfiguration = {
    timestamp: true,
    pid: true,
    colorize: true,
    multiline: true,
    showHidden: true,
    showData: true,
    depth: true,
    level: 2,
  };

  protected static loggerLevel = {
    error: {
      level: 0,
      lowerCase: 'error',
      upperCase: 'ERROR',
      color: 'red',
    },
    warn: {
      level: 1,
      lowerCase: 'warn',
      upperCase: 'WARN',
      color: 'yellow',
    },
    info: {
      level: 2,
      lowerCase: 'info',
      upperCase: 'INFO',
      color: 'green',
    },
    debug: {
      level: 3,
      lowerCase: 'debug',
      upperCase: 'DEBUG',
      color: 'cyan',
    },
  };

  set config(config: ILoggerConfiguration) {
    Logger.config = Logger.mergeConfig(config);
  }

  protected static green = (text: string | number): string =>
    `\x1b[32m${text}\x1b[0m`;
  protected static cyan = (text: string | number): string =>
    `\x1b[36m${text}\x1b[0m`;
  protected static yellow = (text: string | number): string =>
    `\x1b[33m${text}\x1b[0m`;
  protected static red = (text: string | number): string =>
    `\x1b[31m${text}\x1b[0m`;
  protected static dim = (text: string | number): string =>
    `\x1b[2m${text}\x1b[0m`;

  public static getInstance(config?: ILoggerConfiguration): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
      Logger.config = Logger.mergeConfig(config);
    }

    return Logger.instance;
  }

  private static mergeConfig(
    config: ILoggerConfiguration = {},
  ): ILoggerConfiguration {
    return {
      ...Logger.config,
      ...config,
    };
  }

  private static generateTimeStamp(): string {
    const timestamp = new Date(Date.now()).toLocaleString(undefined, {
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      day: '2-digit',
      month: '2-digit',
    });

    return timestamp;
  }

  private static formatLog(
    lowerCase: string,
    upperCase: string,
    message: string,
    context: string,
    config: ILoggerConfiguration,
  ): TFormattedLog {
    const { colorize: isColorize, timestamp, pid } = config;

    const formattedTimestamp: string = timestamp
      ? ` ${Logger.generateTimeStamp()} `
      : ' ';

    let formattedPID: string = pid ? ` ${process.pid}` : '';
    let formattedLevel = `[${upperCase}]`;
    let formattedContext = context ? `[${context}] ` : '';
    let formattedMessage = message;
    const color: string =
      Logger.loggerLevel[lowerCase as keyof typeof Logger.loggerLevel].color;

    if (isColorize) {
      formattedLevel =
        Logger[color as 'yellow' | 'green' | 'red'](formattedLevel);
      formattedContext = Logger.yellow(formattedContext);
      formattedPID = Logger.green(formattedPID);
      formattedMessage =
        Logger[color as 'yellow' | 'green' | 'red'](formattedMessage);
    }

    return {
      formattedLevel,
      formattedContext,
      formattedMessage,
      formattedTimestamp,
      formattedPID,
    };
  }

  private static formatTrace(
    errorTrace: string[],
    callback: (trace: TFormattedTrace | undefined, traceIndex: number) => void,
  ): void {
    errorTrace.forEach((trace, index) => {
      const trimedTrace: string = trace.trim();
      if (trimedTrace.startsWith('at')) {
        const trimedRawTrace: string = trimedTrace.replace('at', '').trim();
        const additionalInfo: string[] | null =
          trimedRawTrace.match(/\((.*?)\)/g);
        const filePath: string =
          Array.isArray(additionalInfo) && additionalInfo.length > 0
            ? additionalInfo[0].replace(/\(|\)/g, '')
            : trimedRawTrace;
        const parsedFilePath: ParsedPath = parse(filePath);
        const hasFileName = !!parsedFilePath.ext;
        let fileName: string = parsedFilePath.base;
        const lastIndexOfColon: number = fileName.lastIndexOf(':');
        hasFileName && lastIndexOfColon > -1
          ? (fileName = fileName.substring(0, lastIndexOfColon))
          : (fileName = '');
        const invokedFunction: string =
          Array.isArray(additionalInfo) && additionalInfo.length > 0
            ? trimedRawTrace.replace(/\((.*?)\).*/g, '').trim()
            : '';

        callback(
          {
            invokedFunction,
            fileName,
            filePath,
          },
          index,
        );
      }
    });
  }

  private static printMultilineLog(logs: TFormattedLog): void {
    const {
      formattedContext,
      formattedMessage,
      formattedLevel,
      formattedTimestamp,
      formattedPID,
    } = logs;

    process.stdout.write(
      `${formattedLevel}${formattedPID}${formattedTimestamp}${formattedContext}${formattedMessage}\n`,
    );
  }

  private static printMultilineData<T>(
    data: T,
    config: ILoggerConfiguration,
  ): void {
    if (data !== undefined) {
      const { depth, colorize, showHidden } = config;

      let depthLevel = null;
      if (depth === true) {
        depthLevel = null;
      } else if (depth === false) {
        depthLevel = -1;
      } else if (!Number.isNaN(depth)) {
        depthLevel = depth;
      }

      const formattedData: string = inspect(data, {
        depth: depthLevel,
        colors: colorize,
        showHidden,
      });

      process.stdout.write(`${formattedData}\n`);
    }
  }

  private static printMultilineTrace(
    trace: TFormattedTrace | undefined,
    config: ILoggerConfiguration,
  ): void {
    if (trace) {
      let colorizedInvokedFn = trace.invokedFunction
        ? `${trace.invokedFunction} `
        : '';
      let colorizedFilePath = trace.filePath ? trace.filePath : '';
      const fileName = trace.fileName ? trace.fileName : '';
      let dash = '-';
      if (config.colorize) {
        colorizedInvokedFn = Logger.yellow(colorizedInvokedFn);
        colorizedFilePath = Logger.dim(colorizedFilePath);
        dash = Logger.dim(dash);
      }
      process.stdout.write(`${dash} ${colorizedInvokedFn}${fileName}\n`);
      process.stdout.write(`  ${colorizedFilePath}\n`);
    }
  }

  private static printOneLineLog(
    logs: TFormattedLog,
    breakLine?: boolean,
  ): void {
    const {
      formattedContext,
      formattedMessage,
      formattedLevel,
      formattedTimestamp,
      formattedPID,
    } = logs;

    const br: string = breakLine ? '\n' : ' ';

    process.stdout.write(
      `${formattedLevel}${formattedPID}${formattedTimestamp}${formattedContext}${formattedMessage}${br}`,
    );
  }

  private static printOneLineData<T>(
    data: T,
    config: ILoggerConfiguration,
    breakLine?: boolean,
  ): void {
    if (data !== undefined) {
      const { depth, colorize, showHidden } = config;

      const br: string = breakLine ? '\n' : ' ';

      let depthLevel = null;
      if (depth === true) {
        depthLevel = null;
      } else if (depth === false) {
        depthLevel = -1;
      } else if (!Number.isNaN(depth)) {
        depthLevel = depth;
      }
      const breakLength = 999999;
      const formattedData: string = inspect(data, {
        colors: colorize,
        depth: depthLevel,
        showHidden,
        breakLength,
        compact: breakLength,
      });

      process.stdout.write(`${formattedData}${br}`);
    } else {
      process.stdout.write('\n');
    }
  }

  private static printOneLineTrace(trace: string, breakLine?: boolean): void {
    const br: string = breakLine ? '\n' : ' ';
    process.stdout.write(`${trace}${br}`);
  }

  log<T>(
    message: string,
    context = '',
    data?: T,
    config?: ILoggerConfiguration,
  ): void {
    return Logger.log(message, context, data, config);
  }

  static log<T>(
    message: string,
    context = '',
    data?: T,
    config?: ILoggerConfiguration,
  ): void {
    const infoConfig = Logger.loggerLevel.info;
    const lowerCase: string = infoConfig.lowerCase;
    const upperCase: string = infoConfig.upperCase;

    let mergedConfig = Logger.config;
    if (config) {
      mergedConfig = Logger.mergeConfig(config);
    }

    if ((mergedConfig?.level ?? 0) - infoConfig.level < 0) {
      return;
    }

    const logs = Logger.formatLog(
      lowerCase,
      upperCase,
      message,
      context,
      mergedConfig,
    );
    if (mergedConfig.multiline) {
      Logger.printMultilineLog(logs);
      if (mergedConfig.showData) {
        Logger.printMultilineData(data, mergedConfig);
      }
    } else {
      Logger.printOneLineLog(logs, !mergedConfig.showData);
      if (mergedConfig.showData) {
        Logger.printOneLineData(data, mergedConfig, true);
      }
    }
  }

  debug<T>(
    message: string,
    context = '',
    data?: T,
    config?: ILoggerConfiguration,
  ): void {
    return Logger.debug(message, context, data, config);
  }

  static debug<T>(
    message: string,
    context = '',
    data?: T,
    config?: ILoggerConfiguration,
  ): void {
    const debugInfo = Logger.loggerLevel.debug;
    const lowerCase: string = debugInfo.lowerCase;
    const upperCase: string = debugInfo.upperCase;

    let mergedConfig = Logger.config;
    if (config) {
      mergedConfig = Logger.mergeConfig(config);
    }

    if (typeof config?.depth !== 'number') {
      mergedConfig.depth = true;
    }

    if ((mergedConfig?.level ?? 0) - debugInfo.level < 0) {
      return;
    }

    const logs = Logger.formatLog(
      lowerCase,
      upperCase,
      message,
      context,
      mergedConfig,
    );
    if (mergedConfig.multiline) {
      Logger.printMultilineLog(logs);
      if (mergedConfig.showData) {
        Logger.printMultilineData(data, mergedConfig);
      }
    } else {
      Logger.printOneLineLog(logs, !mergedConfig.showData);
      if (mergedConfig.showData) {
        Logger.printOneLineData(data, mergedConfig, true);
      }
    }
  }

  warn<T>(
    message: string,
    context = '',
    data?: T,
    config?: ILoggerConfiguration,
  ): void {
    return Logger.warn(message, context, data, config);
  }

  static warn<T>(
    message: string,
    context = '',
    data?: T,
    config?: ILoggerConfiguration,
  ): void {
    const warnConfig = Logger.loggerLevel.warn;
    const lowerCase: string = warnConfig.lowerCase;
    const upperCase: string = warnConfig.upperCase;

    let mergedConfig = Logger.config;
    if (config) {
      mergedConfig = Logger.mergeConfig(config);
    }

    if ((mergedConfig?.level ?? 0) - warnConfig.level < 0) {
      return;
    }

    const logs = Logger.formatLog(
      lowerCase,
      upperCase,
      message,
      context,
      mergedConfig,
    );

    if (mergedConfig.multiline) {
      Logger.printMultilineLog(logs);
      if (mergedConfig.showData) {
        Logger.printMultilineData(data, mergedConfig);
      }
    } else {
      Logger.printOneLineLog(logs, !mergedConfig.showData);
      if (mergedConfig.showData) {
        Logger.printOneLineData(data, mergedConfig, true);
      }
    }
  }

  error<T>(
    message: string,
    error: Error,
    context = '',
    data?: T,
    config?: ILoggerConfiguration,
  ): void {
    return Logger.error(message, error, context, data, config);
  }

  static error<T>(
    message: string,
    error: Error,
    context = '',
    data?: T,
    config?: ILoggerConfiguration,
  ): void {
    const lowerCase: string = Logger.loggerLevel.error.lowerCase;
    const upperCase: string = Logger.loggerLevel.error.upperCase;

    let mergedConfig = Logger.config;
    if (config) {
      mergedConfig = Logger.mergeConfig(config);
    }

    const logs = Logger.formatLog(
      lowerCase,
      upperCase,
      message,
      context,
      mergedConfig,
    );
    const isError: boolean = error instanceof Error;

    if (mergedConfig.multiline) {
      Logger.printMultilineLog(logs);
      if (mergedConfig.showData) {
        Logger.printMultilineData(data, mergedConfig);
      }
      if (isError) {
        const errorStack = error.stack || '';
        const errorTrace: string[] = errorStack.split('\n');
        Logger.formatTrace(errorTrace, (eachTrace) => {
          Logger.printMultilineTrace(eachTrace, mergedConfig);
        });
      }
    } else {
      Logger.printOneLineLog(logs, !mergedConfig.showData && !isError);
      if (mergedConfig.showData) {
        Logger.printOneLineData(data, mergedConfig, false);
      }
      if (isError) {
        const errorStack = error.stack || '';
        const errorTrace: string[] = errorStack.split('\n');
        const totalTrace: number = errorTrace.length;
        let printedTrace = '';
        Logger.formatTrace(errorTrace, (eachTrace, index) => {
          const willPrintSpace = !printedTrace ? '' : ' ';
          const willPrintComma = index === totalTrace - 1 ? '' : ',';
          if (eachTrace) {
            let colorizedInvokedFn = eachTrace.invokedFunction
              ? `${eachTrace.invokedFunction} `
              : '';
            let colorizedFilePath = eachTrace.filePath
              ? `(${eachTrace.filePath})`.replace(process.cwd(), '')
              : '';
            if (mergedConfig.colorize) {
              colorizedInvokedFn = Logger.yellow(colorizedInvokedFn);
              colorizedFilePath = Logger.dim(colorizedFilePath);
            }
            printedTrace += `${willPrintSpace}${colorizedInvokedFn}${colorizedFilePath}${willPrintComma}`;
          }
        });

        Logger.printOneLineTrace(printedTrace, true);
      }
    }
  }
}
