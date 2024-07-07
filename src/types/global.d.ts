import { DataSource } from "typeorm";

declare global {
  var __CONNECTION__: DataSource | undefined;
}