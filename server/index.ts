import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { createServer, Server } from "http";

function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [express] ${message}`);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Basic password protection middleware
app.use((req, res, next) => {
  const PASSWORD = '123';
  const providedPassword = req.headers['x-password'] || req.query.password;
  
  // Skip auth for auth-related endpoints
  if (req.path.startsWith('/auth')) {
    return next();
  }

  if (providedPassword === PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  registerRoutes(app);
  const server = createServer(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Try to find an available port starting from 5000
  async function findAvailablePort(startPort: number): Promise<number> {
    return new Promise((resolve) => {
      const testServer = createServer();
      testServer.listen(startPort, "0.0.0.0", () => {
        testServer.close(() => resolve(startPort));
      });
      testServer.on("error", () => {
        resolve(findAvailablePort(startPort + 1));
      });
    });
  }

  // Find and use first available port starting from 5000
  const startPort = 5000;
  let retries = 0;
  const maxRetries = 10;
  let serverInstance: Server | undefined;
  
  const startServer = async (port: number): Promise<Server> => {
    return new Promise((resolve, reject) => {
      try {
        const instance = server.listen(process.env.PORT ? parseInt(process.env.PORT) : port, "0.0.0.0", () => {
          const actualPort = (instance.address() as any).port;
          log(`serving on port ${actualPort}`);
          resolve(instance);
        });

        instance.on("error", (err: Error) => {
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  };

  while (retries < maxRetries) {
    try {
      const port = await findAvailablePort(startPort + retries);
      serverInstance = await startServer(port);
      
      if (serverInstance) {
        // Setup cleanup handlers
        serverInstance.on("close", () => {
          log("Server closed");
        });
        
        serverInstance.on("error", (err: Error) => {
          log(`Server error: ${err.message}`);
          serverInstance?.close();
        });
        
        // Successfully started
        break;
      }
    } catch (err) {
      log(`Failed to start on port ${startPort + retries}: ${err}`);
      retries++;
      
      if (retries >= maxRetries) {
        log(`Failed to find available port after ${maxRetries} attempts`);
        process.exit(1);
      }
      
      // Wait briefly before trying next port
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Handle cleanup on shutdown
  const cleanup = () => {
    if (serverInstance && serverInstance.listening) {
      serverInstance.close(() => {
        log('Server closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  const setupCleanupHandlers = () => {
    process.on('SIGTERM', () => {
      log('Received SIGTERM signal, shutting down gracefully');
      cleanup();
    });

    process.on('SIGINT', () => {
      log('Received SIGINT signal, shutting down gracefully');
      cleanup();
    });

    if (serverInstance) {
      serverInstance.on("error", (err: Error) => {
        log(`Server error: ${err.message}`);
        cleanup();
      });
    }
  };

  setupCleanupHandlers();
})();
