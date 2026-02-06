require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database/connection');
const parkingRoutes = require('./routes/parking');
const { requestLogger, errorHandler } = require('./middlewares');

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Middleware
 */
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);

/**
 * Health Check
 */
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Parking Lot Backend is running' });
});

/**
 * API Routes
 */
app.use('/api/parking', parkingRoutes);

/**
 * Error Handling
 */
app.use(errorHandler);

/**
 * Initialize and Start Server
 */
async function startServer() {
    try {
        // Initialize database
        await db.initialize();

        // Start server
        app.listen(PORT, () => {
            console.log(`🚗 Parking Lot Backend running on http://localhost:${PORT}`);
            console.log(`📊 API Documentation available at http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

/**
 * Graceful Shutdown
 */
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await db.close();
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;
