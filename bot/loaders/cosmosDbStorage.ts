import * as path from "path";
import { CosmosDbPartitionedStorage } from "botbuilder-azure";
const dotenv = require("dotenv");
if (process.env.NODE_ENV !== "production") {
  const ENV_FILE = path.join(__dirname, ".env.teamsfx.local");
  dotenv.config({ path: ENV_FILE });
}

const cosmosDbStorage = new CosmosDbPartitionedStorage({
  cosmosDbEndpoint: process.env.CosmosDbEndpoint,
  authKey: process.env.CosmosDbAuthKey,
  databaseId: process.env.CosmosDbDatabaseId,
  containerId: process.env.CosmosDbContainerId,
  compatibilityMode: false,
});

export default cosmosDbStorage;
