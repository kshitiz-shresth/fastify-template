const { exec } = require("child_process");

const migrationName = process.argv[2]; // Get the migration name from command-line arguments

if (!migrationName) {
  console.error("Error: Please provide a migration name.");
  process.exit(1);
}

const command = `npx knex migrate:make "${migrationName}" --knexfile src/config/knexprod.ts`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error creating migration: ${error.message}`);
    process.exit(1);
  }
  if (stderr) {
    console.error(`Error: ${stderr}`);
    process.exit(1);
  }
  console.log(`Migration created successfully:\n${stdout}`);
});
