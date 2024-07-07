import { connectionSource } from "./src/database/ormconfig";
import 'reflect-metadata'; // Ensure reflect-metadata is imported for TypeORM
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';

afterAll(async () => {
  if (connectionSource.isInitialized) {
    await connectionSource.destroy();
  }
});