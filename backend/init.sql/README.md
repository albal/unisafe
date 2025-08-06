# UniSafe Database Initialization

This directory contains SQL scripts to initialize the UniSafe PostgreSQL database.

## Files

The SQL files are executed in alphabetical order by the setup script:

### 01-create-database.sql
- Creates the `unisafe_user` role with appropriate permissions
- Sets up database privileges
- Note: Database creation is handled by the setup script

### 02-create-tables.sql
- Creates all required tables:
  - `reddit_posts` - Raw Reddit post data
  - `firmware_issues` - Analyzed firmware problems  
  - `risk_assessments` - Risk evaluations
  - `scan_results` - Scan execution history

### 03-create-indexes.sql
- Creates database indexes for optimal query performance
- Indexes on commonly queried columns

### 04-sample-data.sql
- Inserts sample data for development and testing
- Includes example posts, issues, and assessments
- **Note**: This is for development only - remove for production

## Usage

### Automatic Setup
The SQL files are automatically executed when you run:
```bash
./setup-database.sh
```

### Manual Setup
You can also run them manually:
```bash
# Connect to PostgreSQL as the unisafe_user
psql postgresql://unisafe_user:unisafe_password@localhost:5432/unisafe

# Run each file in order
\i init.sql/01-create-database.sql
\i init.sql/02-create-tables.sql  
\i init.sql/03-create-indexes.sql
\i init.sql/04-sample-data.sql
```

### Docker Setup
For Docker environments, these files can be mounted to `/docker-entrypoint-initdb.d/` to auto-initialize the database.

## Production Notes

- Remove or skip `04-sample-data.sql` in production environments
- The backend application will also create tables automatically if they don't exist
- Database user permissions are set up to allow the application to create/modify tables as needed
