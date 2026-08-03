export default () => {
  const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '8000', 10),
    database: {
      url: process.env.DATABASE_URL,
      directUrl: process.env.DIRECT_DATABASE_URL,
    },
    frontendUrl: process.env.FRONTEND_URL,
    cookieSecret: process.env.COOKIE_SECRET,
    jwt: {
      secret: process.env.JWT_SECRET,
      refreshSecret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '30d',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    },
    cookie: {
      refreshName: process.env.COOKIE_REFRESH_NAME || 'refreshToken',
      path: process.env.COOKIE_PATH || '/',
      sameSite: (process.env.COOKIE_SAME_SITE || 'lax') as 'lax' | 'strict' | 'none',
      secure: process.env.COOKIE_SECURE
        ? process.env.COOKIE_SECURE === 'true'
        : process.env.NODE_ENV === 'production',
      signed: process.env.COOKIE_SIGNED === 'true',
    },
    session: {
      absoluteDays: parseInt(process.env.SESSION_ABSOLUTE_DAYS || '30', 10),
      rememberMeDays: parseInt(process.env.SESSION_REMEMBER_ME_DAYS || '30', 10),
      idleDays: parseInt(process.env.SESSION_IDLE_DAYS || '30', 10),
      multiDevice: process.env.SESSION_MULTI_DEVICE === 'true',
    },
    security: {
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
      passwordHistorySize: parseInt(process.env.PASSWORD_HISTORY_SIZE || '10', 10),
    },
    throttle: {
      ttlMs: parseInt(process.env.THROTTLE_TTL_MS || '60000', 10),
      limit: parseInt(process.env.THROTTLE_LIMIT || '20', 10),
      authLimit: parseInt(process.env.THROTTLE_AUTH_LIMIT || '10', 10),
    },
  };

  if (config.nodeEnv === 'production') {
    const weakSecrets = ['task-mgr-jwt-secret-dev-only', 'secret', 'change-me', 'jwt-secret'];
    if (weakSecrets.includes(config.jwt.secret || '')) {
      console.error('FATAL: JWT_SECRET is too weak for production. Set a strong, unique secret.');
      process.exit(1);
    }
  }

  return config;
};
