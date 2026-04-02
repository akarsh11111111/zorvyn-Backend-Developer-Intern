import app from "./app";
import { env } from "./config/env";
import { bootstrapDefaultAdmin } from "./utils/bootstrap";

async function startServer() {
  await bootstrapDefaultAdmin();

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${env.port}`);
  });
}

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", error);
  process.exit(1);
});
