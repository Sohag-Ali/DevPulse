

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  port: process.env.PORT || 5e3,
  connectionString: process.env.CONNECTION_STRING || "",
  jwtSecret: process.env.JWT_SECRET,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5000"
};
var config_default = config;

// src/db/index.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: config_default.connectionString
});
var initDB = async () => {
  try {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    
    name VARCHAR(100) NOT NULL,
    
    email VARCHAR(150) UNIQUE NOT NULL,
    
    password TEXT NOT NULL,
    
    role VARCHAR(20) NOT NULL DEFAULT 'contributor'
    CHECK (role IN ('contributor', 'maintainer')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
      `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues (

        id SERIAL PRIMARY KEY,

        title VARCHAR(150) NOT NULL,

        description TEXT NOT NULL
        CHECK (LENGTH(description) >= 20),

        type VARCHAR(30) NOT NULL
        CHECK (type IN ('bug', 'feature_request')),

        status VARCHAR(30) DEFAULT 'open'
        CHECK (
          status IN (
            'open',
            'in_progress',
            'resolved'
          )
        ),

        reporter_id INT NOT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database initialized successfully");
  } catch (error) {
    console.log(error);
  }
};

// src/utils/AppError.ts
var AppError = class extends Error {
  // Custom error class to include HTTP status codes
  statusCode;
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
};
var AppError_default = AppError;

// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
var createUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashedPassword = await bcrypt.hash(password, 10);
  const existingUser = await pool.query(`
        SELECT * FROM users WHERE email = $1
    `, [email]);
  if (existingUser.rows.length > 0) {
    throw new AppError_default(400, "User with this email already exists");
  }
  const result = await pool.query(`
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, COALESCE($4, 'contributor'))
        RETURNING *
    `, [name, email, hashedPassword, role]);
  delete result.rows[0].password;
  return result;
};
var loginUserFromDB = async (payload) => {
  const { email, password } = payload;
  const existingUser = await pool.query(`
        SELECT * FROM users WHERE email = $1
    `, [email]);
  const user = existingUser.rows[0];
  if (!user) {
    throw new AppError_default(400, "User with this email does not exist");
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError_default(400, "Invalid password");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const token = jwt.sign(jwtPayload, config_default.jwtSecret, { expiresIn: "10d" });
  delete user.password;
  return {
    token,
    user
  };
};
var authService = {
  createUserIntoDB,
  loginUserFromDB
};

// src/utils/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    errors: data.errors
  });
};
var sendResponse_default = sendResponse;

// src/utils/catchAsync.ts
var catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(
      fn(req, res, next)
    ).catch(next);
  };
};
var catchAsync_default = catchAsync;

// src/modules/auth/auth.controller.ts
var createUser = catchAsync_default(
  async (req, res) => {
    const result = await authService.createUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  }
);
var loginUser = catchAsync_default(
  async (req, res) => {
    const result = await authService.loginUserFromDB(req.body);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: result
    });
  }
);
var authController = {
  createUser,
  loginUser
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.createUser);
router.post("/login", authController.loginUser);
var authRouter = router;

// src/middleware/logger.ts
import fs from "fs";
var logger = (req, res, next) => {
  console.log("Time:", Date.now());
  const log = `
Method -> ${req.method}, URL -> ${req.url}, Time -> ${(/* @__PURE__ */ new Date()).toISOString()}
`;
  console.log(log);
  fs.appendFile("logger.txt", log, (err) => {
    if (err) {
    }
  });
  next();
};
var logger_default = logger;

// src/modules/issue/issue.route.ts
import { Router as Router2 } from "express";

// src/modules/issue/issue.service.ts
var createIssueIntoDB = async (issueData, reporter_id) => {
  const { title, description, type } = issueData;
  const result = await pool.query(`
        INSERT INTO issues (title, description, type, reporter_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `, [title, description, type, reporter_id]);
  return result;
};
var getAllIssuesFromDB = async (query) => {
  const { sort = "newest", type, status } = query;
  let baseQuery = `SELECT * FROM issues`;
  if (type) {
    baseQuery += ` WHERE type = '${type}'`;
  }
  if (status) {
    if (type) {
      baseQuery += ` AND status = '${status}'`;
    } else {
      baseQuery += ` WHERE status = '${status}'`;
    }
  }
  if (sort === "oldest") {
    baseQuery += ` ORDER BY created_at ASC`;
  } else {
    baseQuery += ` ORDER BY created_at DESC`;
  }
  const result = await pool.query(baseQuery);
  const issues = result.rows;
  const reporterIds = issues.map((issue) => issue.reporter_id);
  const reporterData = await pool.query(`
        SELECT id, name, role FROM users WHERE id = ANY($1)
    `, [reporterIds]);
  const reporters = reporterData.rows;
  const issuesWithReporterInfo = issues.map((issue) => {
    const reporter = reporters.find((r) => r.id === issue.reporter_id);
    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter,
      created_at: issue.created_at,
      updated_at: issue.updated_at
    };
  });
  return issuesWithReporterInfo;
};
var getSingleIssueFromDB = async (id) => {
  const issueResult = await pool.query(`
    SELECT *
    FROM issues
    WHERE id = $1
    `, [id]);
  const issue = issueResult.rows[0];
  if (!issue) {
    throw new AppError_default(404, "Issue not found");
  }
  const reporterResult = await pool.query(
    `
        SELECT id, name, role
        FROM users
        WHERE id = $1
        `,
    [issue.reporter_id]
  );
  const reporter = reporterResult.rows[0];
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
};
var updateIssueInDB = async (id, payload, user) => {
  const existingIssueResult = await pool.query(`
        SELECT * FROM issues WHERE id = $1
        `, [id]);
  const existingIssue = existingIssueResult.rows[0];
  if (!existingIssue) {
    throw new AppError_default(404, "Issue not found");
  }
  if (user.role === "contributor") {
    if (existingIssue.reporter_id !== user.id) {
      throw new AppError_default(403, "You are not authorized to update this issue");
    }
    if (existingIssue.status !== "open") {
      throw new AppError_default(400, "Only open issues can be updated");
    }
  }
  const { title, description, type } = payload;
  const result = await pool.query(`
        UPDATE issues
        SET title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
        `, [title, description, type, id]);
  return result.rows[0];
};
var deleteIssueFromDB = async (id, user) => {
  if (user.role !== "maintainer") {
    throw new AppError_default(403, "You are not authorized to delete this issue");
  }
  const result = await pool.query(`
        DELETE FROM issues
        WHERE id = $1
        RETURNING *
        `, [id]);
  return result.rows[0];
};
var issueService = {
  createIssueIntoDB,
  getSingleIssueFromDB,
  getAllIssuesFromDB,
  updateIssueInDB,
  deleteIssueFromDB
};

// src/modules/issue/issue.controller.ts
var createIssue = catchAsync_default(
  async (req, res) => {
    const reporter_id = req.user?.id;
    const result = await issueService.createIssueIntoDB(req.body, reporter_id);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  }
);
var getAllIssues = catchAsync_default(
  async (req, res) => {
    const result = await issueService.getAllIssuesFromDB(req.query);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      data: result
    });
  }
);
var getSingleIssue = catchAsync_default(
  async (req, res) => {
    const { id } = req.params;
    const result = await issueService.getSingleIssueFromDB(id);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      data: result
    });
  }
);
var updateIssue = catchAsync_default(
  async (req, res) => {
    const { id } = req.params;
    const result = await issueService.updateIssueInDB(id, req.body, req.user);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  }
);
var deleteIssue = catchAsync_default(
  async (req, res) => {
    const { id } = req.params;
    const result = await issueService.deleteIssueFromDB(id, req.user);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully"
    });
  }
);
var issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = () => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized access"
        });
      }
      const decoded = jwt2.verify(token, config_default.jwtSecret);
      const userData = await pool.query(`
                SELECT * FROM users WHERE email = $1
            `, [decoded.email]);
      const user = userData.rows[0];
      if (!user) {
        return sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized access"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      return sendResponse_default(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized access",
        errors: error
      });
    }
  };
};
var auth_default = auth;

// src/modules/issue/issue.route.ts
var router2 = Router2();
router2.post("/", auth_default(), issueController.createIssue);
router2.get("/", issueController.getAllIssues);
router2.get("/:id", issueController.getSingleIssue);
router2.patch("/:id", auth_default(), issueController.updateIssue);
router2.delete("/:id", auth_default(), issueController.deleteIssue);
var issueRouter = router2;

// src/app.ts
import cors from "cors";

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/app.ts
var app = express();
app.use(express.json());
app.use(logger_default);
var corsOptions = {
  origin: config_default.clientUrl
};
app.use(cors(corsOptions));
app.use("/api/auth", authRouter);
app.use("/api/issues", issueRouter);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map