import { config } from './config';
import { createApp } from './app';
import logger from './utils/logger';

const app = createApp();

app.listen(config.PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${config.PORT}`);
  logger.info(`📋 Health check: http://localhost:${config.PORT}/api/health`);
  logger.info(`🌍 Environment: ${config.NODE_ENV}`);
});
