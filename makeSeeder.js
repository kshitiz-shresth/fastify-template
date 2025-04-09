const { exec } = require("child_process");

const seederName = process.argv[2]; // Get the seeder name from command-line arguments

if (!seederName) {
  console.error("Error: Please provide a seeder name.");
  process.exit(1);
}

const command = `npx knex seed:make "${seederName}" --knexfile src/config/knexprod.ts`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error creating seeder: ${error.message}`);
    process.exit(1);
  }
  if (stderr) {
    console.error(`Error: ${stderr}`);
    process.exit(1);
  }
  console.log(`Seeder created successfully:\n${stdout}`);
});
