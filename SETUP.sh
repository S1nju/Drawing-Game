#!/bin/bash

# Real-time Drawing Game Setup & Launch Guide
# ============================================

echo "🎨 Real-time Drawing Game - Setup Instructions"
echo "=============================================="

# 1. Backend Setup
echo -e "\n📋 Step 1: Setting up Backend (Laravel)"
echo "----------------------------------------"
cd DrawingService

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
fi

# Install PHP dependencies
echo "Installing PHP dependencies..."
composer install

# Generate app key
php artisan key:generate

# Run migrations
echo "Running migrations..."
php artisan migrate

# Start Reverb WebSocket server
echo "Starting Reverb WebSocket server..."
php artisan reverb:start &
REVERB_PID=$!
echo "Reverb running with PID: $REVERB_PID"

# Start Laravel dev server (in another terminal needed)
echo "✅ To start Laravel dev server, run in a new terminal:"
echo "cd DrawingService && php artisan serve"

cd ..

# 2. Frontend Setup
echo -e "\n📋 Step 2: Setting up Frontend (React)"
echo "----------------------------------------"
cd FrontEnd/my-react-app

echo "Frontend dependencies already installed!"
echo "✅ To start React dev server, run in a new terminal:"
echo "cd FrontEnd/my-react-app && npm run dev"

cd ../..

# 3. Final Notes
echo -e "\n✅ Setup Complete!"
echo "============================================"
echo "📌 Next Steps:"
echo ""
echo "1. Terminal 1: Start Laravel server"
echo "   cd DrawingService && php artisan serve"
echo ""
echo "2. Terminal 2: Start Reverb WebSocket"
echo "   cd DrawingService && php artisan reverb:start"
echo ""
echo "3. Terminal 3: Start React frontend"
echo "   cd FrontEnd/my-react-app && npm run dev"
echo ""
echo "4. Open browser at http://localhost:5173"
echo ""
echo "🎯 Features:"
echo "   ✓ Real-time drawing synchronization"
echo "   ✓ Multi-player support (same game room)"
echo "   ✓ Color picker & brush size control"
echo "   ✓ Clear canvas & download drawings"
echo "   ✓ Timer & game status tracking"
echo ""
