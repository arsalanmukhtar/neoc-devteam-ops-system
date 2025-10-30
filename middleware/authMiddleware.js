import jwt from "jsonwebtoken";

// --- CONFIGURATION ---
// NOTE: Ensure this is the EXACT same secret used in routes/authRoutes.js
const JWT_SECRET = "YOUR_SUPER_SECURE_JWT_SECRET";

// Define constants for the Role IDs as per your initial SQL data
// This makes the checkRole function much cleaner to use in routes.
export const ADMIN_ROLE_ID = 1;
export const PM_ROLE_ID = 2;
export const DEV_ROLE_ID = 3;

// --- 1. JWT Authentication Middleware ---
/**
 * Verifies the JWT token from the Authorization header and attaches user data (ID, Role) to req.user.
 */
const authMiddleware = (req, res, next) => {
  // 1. Check for the token in the 'Authorization' header ('Bearer <token>')
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  // Extract the token part (strip "Bearer ")
  const token = authHeader.split(" ")[1];

  try {
    // 2. Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3. Attach user data to the request object
    req.user = {
      user_id: decoded.user_id,
      role_id: decoded.role_id,
    };

    // 4. Proceed to the next middleware or route handler
    next();
  } catch (ex) {
    // Catches token errors (e.g., invalid signature, expired)
    console.error("JWT verification failed:", ex.message);
    res.status(400).json({ error: "Invalid or expired token." });
  }
};

// --- 2. Role-Based Authorization Middleware ---
/**
 * Higher-order function that checks if the authenticated user's role matches the required role ID.
 * Must be used AFTER authMiddleware.
 * * @param {number} requiredRoleId - The role_id required to access the resource (e.g., ADMIN_ROLE_ID)
 */
export const checkRole = (requiredRoleId) => (req, res, next) => {
  // Ensure req.user exists (meaning authMiddleware ran successfully)
  if (!req.user) {
    return res
      .status(500)
      .json({
        error: "Role check failed: User data missing (check middleware order).",
      });
  }

  // Check if the user's role matches the required role
  if (req.user.role_id === requiredRoleId) {
    // Role is authorized, continue
    next();
  } else {
    res
      .status(403)
      .json({ error: "Forbidden. Insufficient permissions for this action." });
  }
};

export const isAdminOrPM = (req, res, next) => {
  const userRoleId = req.user.role_id;

  if (userRoleId === ADMIN_ROLE_ID || userRoleId === PM_ROLE_ID) {
    return next();
  }
  res
    .status(403)
    .json({
      error:
        "Forbidden. Only Admins or Project Managers can perform this action.",
    });
};

// Export the primary middleware
export default authMiddleware;