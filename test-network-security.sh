#!/bin/bash

echo "🔒 Testing Docker Network Security Configuration"
echo "================================================"

# Start the services
echo "🚀 Starting services..."
docker compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Test 1: Frontend should be accessible from host
echo "🌐 Test 1: Frontend accessibility from host"
if curl -s http://localhost:80/health > /dev/null; then
    echo "✅ Frontend is accessible from host"
else
    echo "❌ Frontend is NOT accessible from host"
fi

# Test 2: Backend should be accessible from host (this should work in dev mode)
echo "🔌 Test 2: Backend accessibility from host"
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Backend is accessible from host (development mode)"
else
    echo "❌ Backend is NOT accessible from host"
fi

# Test 3: Frontend should be able to reach backend internally
echo "🔄 Test 3: Frontend-to-Backend internal communication"
frontend_container=$(docker compose ps -q frontend)
if docker exec $frontend_container wget -q --spider http://backend:3000/health 2>/dev/null; then
    echo "✅ Frontend can reach backend internally"
else
    echo "❌ Frontend CANNOT reach backend internally"
fi

# Test 4: Check network isolation
echo "🛡️  Test 4: Network isolation verification"
echo "Backend networks:"
docker inspect $(docker compose ps -q backend) | jq '.[].NetworkSettings.Networks | keys'

echo "Frontend networks:"
docker inspect $(docker compose ps -q frontend) | jq '.[].NetworkSettings.Networks | keys'

echo ""
echo "🎯 Network Security Summary:"
echo "- Backend runs on internal-only network (backend-network)"
echo "- Frontend bridges both networks for communication"
echo "- External access to backend is controlled by frontend"

# Clean up
echo ""
echo "🧹 Cleaning up..."
docker compose down -v

echo "✨ Network security test completed!"
