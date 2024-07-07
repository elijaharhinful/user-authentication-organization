import { connectionSource } from "./src/database/ormconfig";

afterAll(async () => {
  if (connectionSource.isInitialized) {
    await connectionSource.destroy();
  }
});