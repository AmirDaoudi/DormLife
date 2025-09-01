"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const connection_1 = require("./connection");
const logger_1 = __importDefault(require("../utils/logger"));
async function runMigrations() {
    try {
        logger_1.default.info('Starting database migrations...');
        // Connect to database
        await connection_1.db.connect();
        // Read and execute schema file
        const schemaPath = path_1.default.join(__dirname, 'schema.sql');
        const schema = fs_1.default.readFileSync(schemaPath, 'utf8');
        // Split schema into individual statements
        const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);
        logger_1.default.info(`Executing ${statements.length} migration statements...`);
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement) {
                try {
                    await connection_1.db.query(statement + ';');
                    logger_1.default.debug(`Migration ${i + 1}/${statements.length} completed`);
                }
                catch (error) {
                    // Ignore "already exists" errors
                    if (error.code === '42P07' || error.code === '42P06' || error.code === '42710') {
                        logger_1.default.debug(`Skipping existing object: ${error.message}`);
                    }
                    else {
                        throw error;
                    }
                }
            }
        }
        logger_1.default.info('Database migrations completed successfully');
    }
    catch (error) {
        logger_1.default.error('Migration failed:', error);
        process.exit(1);
    }
}
// Run migrations if this file is executed directly
if (require.main === module) {
    runMigrations()
        .then(() => {
        logger_1.default.info('Migrations completed, exiting...');
        process.exit(0);
    })
        .catch((error) => {
        logger_1.default.error('Migration process failed:', error);
        process.exit(1);
    });
}
exports.default = runMigrations;
//# sourceMappingURL=migrate.js.map