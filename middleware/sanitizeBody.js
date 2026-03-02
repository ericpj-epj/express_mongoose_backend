import mongoSanitize from "mongo-sanitize";

/**
 * Sanitize and whitelist request body fields
 * @param {string[]} allowedFields - list of allowed body keys
 */
export const sanitizeBody = (allowedFields = []) => {
  return (req, res, next) => {
    try {
      if (!req.body || typeof req.body !== "object") {
        req.body = {};
        return next();
      }

      // Remove Mongo operators ($, .)
      const sanitized = mongoSanitize(req.body);

      // Whitelist allowed fields only
      if (allowedFields.length > 0) {
        const filtered = {};
        for (const key of allowedFields) {
          if (sanitized[key] !== undefined) {
            filtered[key] = sanitized[key];
          }
        }
        req.body = filtered;
      } else {
        req.body = sanitized;
      }

      next();
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_BODY",
          message: "Invalid request body",
        },
      });
    }
  };
};
