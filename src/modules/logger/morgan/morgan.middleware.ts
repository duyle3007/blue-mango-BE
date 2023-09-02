import morgan from 'morgan';
import { RequestHandler, Request, Response } from 'express';
import { Logger } from '../logger.service';

export const morganRequestLogger = (
  logger: Logger,
): RequestHandler<Request, Response> =>
  morgan(
    (tokens, req, res) => {
      const httpVersion = tokens['http-version'](req, res)
        ? `HTTP/${tokens['http-version'](req, res)}`
        : '--';
      const remoteAddress = tokens['remote-addr'](req, res)
        ? tokens['remote-addr'](req, res)
        : '--';
      const userAgent = tokens['user-agent'](req, res)
        ? tokens['user-agent'](req, res)
        : '--';
      const method = tokens.method(req, res) ? tokens.method(req, res) : '--';

      const data = {
        httpVersion,
        remoteAddress,
        userAgent,
      };

      logger.log(`${method} ${tokens.url(req, res) ?? '/'}`, 'Request', data, {
        depth: 0,
        multiline: false,
      });

      return null;
    },
    { immediate: true },
  );

export const morganResponseLogger = (
  logger: Logger,
): RequestHandler<Request, Response> =>
  morgan((tokens, req, res) => {
    const status = tokens.status(req, res)
      ? `${tokens.status(req, res)} ${res.statusMessage}`
      : '--';
    const size = tokens.res(req, res, 'content-length')
      ? `${tokens.res(req, res, 'content-length')} B`
      : '--';
    const time = tokens['response-time'](req, res)
      ? `${tokens['response-time'](req, res)} ms`
      : '--';
    const method = tokens.method(req, res) ? tokens.method(req, res) : '--';

    const data = {
      status,
      time,
      size,
    };

    logger.log(`${method} ${tokens.url(req, res) ?? '/'}`, 'Response', data, {
      depth: 0,
      multiline: false,
    });

    return null;
  });
