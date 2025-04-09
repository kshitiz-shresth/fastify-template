# my-template Backend

## Getting Started

### Step 1: Set Up Environment Variables
1. Copy `.env.example` and create a new `.env` file.
2. Update the `.env` file with your configuration as needed.

### Step 2: Add Docker
Ensure Docker is installed on your system. If not, download and install it from [Docker's official website](https://www.docker.com/).

### Step 3: Start the Application
Run the following command to start the application:
```bash
docker-compose up
```

### Step 4: Access the my-template API Container
After the setup is complete, run:
```bash
npm run bash
```
This command opens a shell inside the `my-template-api` Docker container, where you will perform all project-related commands.

---

## Adminer Database Management
You can access Adminer for database management at [http://localhost:8080](http://localhost:8080).

### Default Login Credentials:
- **DB Host**: `mysql`
- **Username**: `root`
- **Password**: `password`

These credentials can be changed in the `.env` file.

---

## Database Migration Commands
Run the following commands inside the `my-template-api` container:

1. **Create a New Migration**
   ```bash
   npm run make-migration
   ```

2. **Migrate Up**
   ```bash
   npm run migrate:up
   ```

3. **Migrate Down**
   ```bash
   npm run migrate:down
   ```

---

That's it! You're all set up to work on the Backend.

