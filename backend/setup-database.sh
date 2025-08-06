#!/bin/bash

# UniSafe Database Setup Script
# This script creates the PostgreSQL database and user for UniSafe

echo "🔧 Setting up UniSafe database..."

# Database configuration
DB_NAME="unisafe"
DB_USER="unisafe_user"
DB_PASSWORD="unisafe_password"
DB_HOST="localhost"
DB_PORT="5432"

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST -p $DB_PORT; then
    echo "❌ PostgreSQL is not running on $DB_HOST:$DB_PORT"
    echo "Please start PostgreSQL first:"
    echo "  sudo systemctl start postgresql"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Create database user
echo "📝 Creating database user..."
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || echo "User already exists"

# Create database
echo "📝 Creating database..."
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || echo "Database already exists"

# Grant privileges
echo "📝 Granting privileges..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"

echo "✅ Database setup complete!"
echo ""
echo "📋 Database connection details:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo ""
echo "🔗 Connection string:"
echo "  postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""
echo "📝 Next steps:"
echo "  1. Copy .env.example to .env"
echo "  2. Update DATABASE_URL in .env with the connection string above"
echo "  3. Add your Reddit API credentials to .env"
echo "  4. Run 'npm run dev' to start the server"
echo ""

# Initialize database schema
echo "🏗️  Initializing database schema..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_DIR="$SCRIPT_DIR/init.sql"

if [ -d "$SQL_DIR" ]; then
    echo "📝 Running SQL initialization scripts..."
    
    # Run each SQL file in order
    for sql_file in "$SQL_DIR"/*.sql; do
        if [ -f "$sql_file" ]; then
            echo "  - Running $(basename "$sql_file")..."
            PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$sql_file"
            if [ $? -eq 0 ]; then
                echo "    ✅ Success"
            else
                echo "    ❌ Failed"
            fi
        fi
    done
else
    echo "⚠️  SQL directory not found: $SQL_DIR"
fi

# Test connection
echo "🧪 Testing database connection..."
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT version();" >/dev/null 2>&1; then
    echo "✅ Database connection successful!"
    
    # Show table count
    TABLE_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
    echo "📊 Created $TABLE_COUNT tables"
else
    echo "❌ Database connection failed"
    echo "Please check your PostgreSQL installation and try again"
fi
