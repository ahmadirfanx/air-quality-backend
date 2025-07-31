import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 2 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 file uploads per hour
  message: {
    success: false,
    error: 'Too many file uploads from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
