#!/bin/bash

# UniSafe Database Verification Script
# This script verifies that all SQL files are present and valid

echo "🔍 Verifying UniSafe database setup files..."
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_DIR="$SCRIPT_DIR/init.sql"
ERROR_COUNT=0

# Check if SQL directory exists
if [ ! -d "$SQL_DIR" ]; then
    echo "❌ SQL directory not found: $SQL_DIR"
    exit 1
fi

echo "✅ SQL directory found: $SQL_DIR"

# Expected SQL files in order
EXPECTED_FILES=(
    "01-create-database.sql"
    "02-create-tables.sql"
    "03-create-indexes.sql"
    "04-sample-data.sql"
)

# Check each expected file
for sql_file in "${EXPECTED_FILES[@]}"; do
    file_path="$SQL_DIR/$sql_file"
    
    if [ -f "$file_path" ]; then
        # Check if file is not empty
        if [ -s "$file_path" ]; then
            echo "✅ $sql_file ($(wc -l < "$file_path") lines)"
            
            # Basic SQL syntax check
            if grep -q "CREATE TABLE\|CREATE INDEX\|INSERT INTO\|CREATE ROLE" "$file_path"; then
                echo "   📝 Contains SQL statements"
            else
                echo "   ⚠️  No recognized SQL statements found"
                ((ERROR_COUNT++))
            fi
        else
            echo "❌ $sql_file (empty file)"
            ((ERROR_COUNT++))
        fi
    else
        echo "❌ $sql_file (missing)"
        ((ERROR_COUNT++))
    fi
done

# Check for unexpected files
echo ""
echo "📋 All files in SQL directory:"
for file in "$SQL_DIR"/*; do
    if [ -f "$file" ]; then
        basename "$file"
    fi
done

echo ""
if [ $ERROR_COUNT -eq 0 ]; then
    echo "🎉 All database setup files are present and valid!"
    echo ""
    echo "📝 Next steps:"
    echo "  1. Ensure PostgreSQL is running"
    echo "  2. Run: ./setup-database.sh"
    echo "  3. Or use Docker: docker-compose up postgres"
else
    echo "❌ Found $ERROR_COUNT errors in database setup files"
    echo "Please fix the issues above before proceeding"
    exit 1
fi
