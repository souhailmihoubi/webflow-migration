import {
  utilities as nestWinstonModuleUtilities,
  WinstonModuleOptions,
} from 'nest-winston';
import * as winston from 'winston';

export const winstonConfig: WinstonModuleOptions = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('MyApp', {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),
    // Access Log (Http requests only)
    new winston.transports.File({
      filename: 'logs/access.log',
      format: winston.format.combine(
        winston.format((info) =>
          info.context === 'HttpLoggingInterceptor' ? info : false,
        )(),
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    // Application Log (Exclude Http requests)
    new winston.transports.File({
      filename: 'logs/app.log',
      format: winston.format.combine(
        winston.format((info) =>
          info.context !== 'HttpLoggingInterceptor' ? info : false,
        )(),
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    // Error Log (Errors only)
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
};
