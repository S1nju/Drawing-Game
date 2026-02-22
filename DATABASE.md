# Database Schema & Configuration

## Drawing Coordinates Table

### Migration File
`database/migrations/2025_02_22_000000_create_drawing_coordinates_table.php`

### Table Structure

```sql
CREATE TABLE drawing_coordinates (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    game_id VARCHAR(255) NOT NULL DEFAULT 'default',
    x FLOAT NOT NULL,
    y FLOAT NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#000000',
    size FLOAT NOT NULL DEFAULT 2,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_game_id (game_id)
);
```

### Column Definitions

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | BIGINT UNSIGNED | AUTO_INCREMENT | Primary key |
| `game_id` | VARCHAR(255) | 'default' | Game room identifier (indexed for fast queries) |
| `x` | FLOAT | - | X coordinate (0-800 for standard canvas) |
| `y` | FLOAT | - | Y coordinate (0-600 for standard canvas) |
| `color` | VARCHAR(7) | '#000000' | Hex color code (#RRGGBB) |
| `size` | FLOAT | 2 | Brush size in pixels (1-50) |
| `created_at` | TIMESTAMP | CURRENT_TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | CURRENT_TIMESTAMP | Last update time |

### Indexes

- **Primary Key**: `id`
- **Index**: `game_id` (improves query speed for game-specific lookups)

---

## Model Configuration

### DrawingCoordinates Model
**File**: `app/Models/DrawingCoordinates.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DrawingCoordinates extends Model
{
    protected $fillable = [
        'x',
        'y',
        'game_id',
        'color',
        'size',
    ];

    protected $casts = [
        'x' => 'float',
        'y' => 'float',
        'size' => 'float',
    ];
}
```

### Usage Examples

```php
// Create new drawing
$drawing = DrawingCoordinates::create([
    'game_id' => 'game_123',
    'x' => 100.5,
    'y' => 150.3,
    'color' => '#FF0000',
    'size' => 5
]);

// Get all drawings for a game
$drawings = DrawingCoordinates::where('game_id', 'game_123')
    ->orderBy('created_at', 'asc')
    ->get();

// Clear game canvas
DrawingCoordinates::where('game_id', 'game_123')->delete();

// Get drawing stats
$count = DrawingCoordinates::where('game_id', 'game_123')->count();
$earliest = DrawingCoordinates::where('game_id', 'game_123')
    ->orderBy('created_at', 'asc')
    ->first();
```

---

## Database Setup

### For SQLite (Default - Development)
```bash
cd DrawingService

# Create database (creates storage/database.sqlite)
touch storage/database.sqlite

# Run migrations
php artisan migrate
```

### For PostgreSQL

**1. Create Database**
```sql
CREATE DATABASE drawing_game;
```

**2. Update .env**
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=drawing_game
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

**3. Run Migrations**
```bash
php artisan migrate
```

### For MySQL

**1. Create Database**
```sql
CREATE DATABASE drawing_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**2. Update .env**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=drawing_game
DB_USERNAME=root
DB_PASSWORD=your_password
```

**3. Run Migrations**
```bash
php artisan migrate
```

---

## Data Management

### Backup & Restore

**Backup SQLite:**
```bash
cp storage/database.sqlite storage/database.sqlite.backup
```

**Backup MySQL:**
```bash
mysqldump -u root -p drawing_game > backup.sql
```

**Restore MySQL:**
```bash
mysql -u root -p drawing_game < backup.sql
```

### Cleanup Old Data

**Delete games older than 7 days:**
```bash
php artisan tinker

DrawingCoordinates::where('created_at', '<', now()->subDays(7))->delete();
```

**Or add scheduled job** in `app/Console/Kernel.php`:
```php
protected function schedule(Schedule $schedule)
{
    $schedule->call(function () {
        DrawingCoordinates::where('created_at', '<', now()->subDays(7))->delete();
    })->daily();
}
```

Run scheduler:
```bash
php artisan schedule:work
```

---

## Query Examples

### Find Total Strokes in Game
```php
$totalStrokes = DrawingCoordinates::where('game_id', 'game_123')->count();
```

### Get Drawing Timeline
```php
$timeline = DrawingCoordinates::where('game_id', 'game_123')
    ->orderBy('created_at', 'asc')
    ->pluck('created_at', 'id');
```

### Stats per Game
```php
$stats = DrawingCoordinates::where('game_id', 'game_123')
    ->selectRaw('
        COUNT(*) as total_strokes,
        COUNT(DISTINCT color) as unique_colors,
        MIN(size) as min_brush_size,
        MAX(size) as max_brush_size,
        MIN(created_at) as started_at,
        MAX(created_at) as ended_at
    ')
    ->first();
```

### Most Used Colors
```php
$colors = DrawingCoordinates::where('game_id', 'game_123')
    ->selectRaw('color, COUNT(*) as usage_count')
    ->groupBy('color')
    ->orderByDesc('usage_count')
    ->get();
```

---

## Performance Optimization

### Index Analysis
```bash
# Check query performance
php artisan tinker

DB::enableQueryLog();
DrawingCoordinates::where('game_id', 'game_123')->get();
dd(DB::getQueryLog());
```

### Recommended Indexes for Production
```php
// In migration
Schema::create('drawing_coordinates', function (Blueprint $table) {
    // ... existing columns ...
    $table->index('game_id');
    $table->index(['game_id', 'created_at']); // Composite index
});
```

### Archive Old Games
```bash
# Create archive table
php artisan make:migration create_drawing_coordinates_archive_table

# In migration
Schema::create('drawing_coordinates_archive', function (Blueprint $table) {
    // Same structure as drawing_coordinates
});

# Move old records
DrawingCoordinates::where('created_at', '<', now()->subMonths(1))
    ->chunk(1000, function ($drawings) {
        DrawingCoordinatesArchive::insert($drawings->toArray());
        DrawingCoordinates::whereIn('id', $drawings->pluck('id'))->delete();
    });
```

---

## Development Tips

### Seed Sample Data
```bash
php artisan tinker

factory(DrawingCoordinates::class, 100)->create([
    'game_id' => 'game_demo_123'
]);
```

### Monitor Database Growth
```bash
# Check database size (SQLite)
ls -lh storage/database.sqlite

# Check table size (MySQL)
SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.TABLES
WHERE table_schema = 'drawing_game'
ORDER BY size_mb DESC;
```

### Enable Query Logging
```env
LOG_CHANNEL=stack
LOG_LEVEL=debug
```

Check `storage/logs/laravel.log` for SQL queries.

---

## Troubleshooting

### Migration Failed: Table Already Exists
```bash
php artisan migrate:refresh --force
# or
php artisan migrate:reset
php artisan migrate
```

### No Such Table Error
```bash
php artisan migrate
# or check database connection in .env
```

### Disk Space Issues
```bash
# Clear old data
php artisan tinker
DrawingCoordinates::truncate();

# Clear cache
php artisan cache:clear
php artisan config:clear
```

---

**Last Updated**: February 22, 2025
