const mongoose = require('mongoose');

const connectWithRetry = async (retries = 5, interval = 5000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const connection = await mongoose.connect(process.env.DATABASE_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
                autoIndex: true, // Build indexes
                maxPoolSize: 10, // Maintain up to 10 socket connections
                socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
                family: 4 // Use IPv4, skip trying IPv6
            });
            
            console.log(`MongoDB connected: ${connection.connection.host}`);
            console.log(`Database name: ${connection.connection.name}`);
            
            // Create indexes for User model
            const User = require('../models/User');
            await User.createIndexes();
            
            return connection;
        } catch (error) {
            console.error(`MongoDB connection attempt ${i + 1} failed:`, error.message);
            
            if (i === retries - 1) {
                console.error('All connection attempts failed. Please check if MongoDB is installed and running.');
                throw new Error(`Failed to connect to MongoDB after ${retries} attempts: ${error.message}`);
            }
            
            console.log(`Retrying in ${interval/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    }
};

const initializeDatabase = async () => {
    try {
        const connection = await connectWithRetry();
        
        // Handle connection errors after initial connection
        mongoose.connection.on('error', error => {
            console.error('MongoDB connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected. Attempting to reconnect...');
            connectWithRetry().catch(error => {
                console.error('Failed to reconnect to MongoDB:', error);
            });
        });

        mongoose.connection.on('connected', () => {
            console.log('MongoDB reconnected successfully');
        });

        mongoose.connection.on('reconnectFailed', () => {
            console.error('MongoDB reconnection failed. Please check your connection.');
        });

        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed through app termination');
                process.exit(0);
            } catch (error) {
                console.error('Error while closing MongoDB connection:', error);
                process.exit(1);
            }
        });
        
        return connection;
    } catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    }
};

module.exports = initializeDatabase;
