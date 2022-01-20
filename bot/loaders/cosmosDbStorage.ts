import * as path from 'path';
const ENV_FILE = path.join(__dirname, '.env.teamsfx.local');
import { CosmosDbPartitionedStorage } from 'botbuilder-azure';
require('dotenv').config({ path: ENV_FILE });

const cosmosDbStorage = new CosmosDbPartitionedStorage({
    cosmosDbEndpoint: process.env.CosmosDbEndpoint,
    authKey: process.env.CosmosDbAuthKey,
    databaseId: process.env.CosmosDbDatabaseId,
    containerId: process.env.CosmosDbContainerId,
    compatibilityMode: false,
});

export default cosmosDbStorage;
