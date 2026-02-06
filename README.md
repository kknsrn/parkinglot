# Smart Parking Lot System

A comprehensive full-stack web application for managing vehicle parking operations in urban parking lots. This system efficiently handles vehicle entry/exit management, parking space allocation, fee calculation, and real-time availability updates.

## 🎯 Features

### Core Functionality
- **Vehicle Check-In/Check-Out**: Record entry and exit times with automatic space allocation
- **Smart Spot Allocation**: First-fit algorithm for efficient parking space management
- **Real-Time Availability**: Live updates of parking space availability across all floors
- **Parking Fee Calculation**: Automatic fee computation based on duration and vehicle type
- **Vehicle History**: Track complete parking history for each vehicle
- **Dashboard Analytics**: Real-time statistics on occupancy, revenue, and floor status

### System Capabilities
- Support for multiple vehicle types (motorcycle, car, SUV, bus)
- Multi-floor parking lot management
- Concurrency handling for simultaneous check-ins/check-outs
- Daily fee caps to prevent excessive charges
- Occupancy rate tracking and visualization

## 🏗️ Architecture

### Backend (Node.js + Express)
```
backend/
├── src/
│   ├── models/              # Data layer (Vehicle, ParkingTransaction, etc.)
│   ├── controllers/         # Request handlers
│   ├── services/           # Business logic layer
│   │   ├── ParkingSpotAllocationService
│   │   ├── FeeCalculationService
│   │   └── ParkingManagementService
│   ├── middlewares/        # Concurrency control, error handling
│   ├── routes/             # API endpoints
│   ├── database/           # SQLite connection and schema
│   ├── utils/              # Helper functions
│   └── index.js            # Server entry point
└── package.json
```

### Frontend (React)
```
frontend/
├── src/
│   ├── components/         # React components
│   │   ├── Dashboard.js
│   │   ├── CheckInOut.js
│   │   └── VehicleStatus.js
│   ├── services/          # API client
│   ├── styles/            # CSS stylesheets
│   ├── utils/             # Helper functions
│   ├── App.js             # Main component
│   └── index.js           # React entry point
├── package.json
└── public/
```

## 📊 Database Schema

### Core Tables
- **vehicles**: Vehicle registration data
- **vehicle_types**: Vehicle type definitions (motorcycle, car, SUV, bus)
- **parking_floors**: Parking floor definitions
- **parking_spaces**: Individual parking space records
- **parking_transactions**: Check-in/check-out records

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env if needed (default port: 5000)
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

The frontend will automatically open at `http://localhost:3000`

## 📡 API Endpoints

### Parking Operations

#### Check-In
```
POST /api/parking/checkin
Body: { "licensePlate": "ABC123" }
```

#### Check-Out
```
POST /api/parking/checkout
Body: { "licensePlate": "ABC123" }
```

#### Vehicle Status
```
GET /api/parking/status/:licensePlate
```

#### Vehicle History
```
GET /api/parking/history/:licensePlate
```

#### Lot Status
```
GET /api/parking/lot-status
```

#### Availability
```
GET /api/parking/availability
```

#### Preview Fee
```
POST /api/parking/preview-fee
Body: { "transactionId": "uuid" }
```

### Vehicle Management

#### Register Vehicle
```
POST /api/parking/vehicle/register
Body: {
  "licensePlate": "ABC123",
  "vehicleType": "car",
  "ownerName": "John Doe",
  "ownerContact": "+1234567890"
}
```

#### Get Vehicle
```
GET /api/parking/vehicle/:licensePlate
```

#### Get All Vehicles
```
GET /api/parking/vehicles
```

#### Get Vehicle Types
```
GET /api/parking/vehicle-types
```

## 🎨 UI Components

### Dashboard
- Real-time occupancy metrics
- Floor-wise status breakdown
- Revenue statistics
- Auto-refresh every 5 seconds

### Check-In/Check-Out
- Quick license plate entry
- Instant parking space assignment
- Automatic fee calculation
- Transaction confirmation

### Vehicle Status
- Current parking status
- Estimated fee preview
- Complete parking history
- Duration and fee breakdown

## 🔒 Concurrency Handling

The system implements a locking mechanism to handle concurrent requests:
- Prevents double-booking of parking spaces
- Ensures accurate fee calculations
- Manages simultaneous check-ins/check-outs
- Thread-safe database operations

## 💰 Fee Calculation Logic

### Pricing Rules
- **Hourly Rate**: Vehicle-type specific
  - Motorcycle: $1.50/hour
  - Car: $3.00/hour
  - SUV: $4.50/hour
  - Bus: $6.00/hour

- **Minimum Charge**: 1 hour (even for shorter stays)
- **Daily Cap**: 24-hour maximum charge at any hourly rate

### Example
- Vehicle: Car (4 hours, 30 minutes)
- Base Fee: 5 hours × $3.00 = $15.00
- With daily cap applied if > 24 hours

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🛠️ Technology Stack

**Backend:**
- Node.js with Express.js
- SQLite database
- UUID for unique identifiers
- CORS for cross-origin requests

**Frontend:**
- React 18
- React Router for navigation
- Axios for API calls
- CSS3 for styling

## 📈 Performance Considerations

### Optimization Strategies
1. **Database Indexing**: Optimized queries for spot allocation
2. **Connection Pooling**: Efficient database resource management
3. **Caching**: Real-time availability updates via polling
4. **Lock-Free Where Possible**: Minimized concurrency bottlenecks

### Time Complexity
- **Spot Allocation**: O(n) - First-fit algorithm
- **Fee Calculation**: O(1) - Direct computation
- **Status Check**: O(1) - Indexed queries

## 🔍 Monitoring & Logging

The system includes:
- Request logging with timestamps
- Error tracking and reporting
- Performance metrics collection
- Graceful shutdown handling

## 📝 Example Usage

### Register a Vehicle
```javascript
POST /api/parking/vehicle/register
{
  "licensePlate": "XYZ789",
  "vehicleType": "car",
  "ownerName": "Jane Smith",
  "ownerContact": "+9876543210"
}
```

### Check-In
```javascript
POST /api/parking/checkin
{ "licensePlate": "XYZ789" }

Response:
{
  "success": true,
  "transactionId": "uuid",
  "vehicle": { "licensePlate": "XYZ789", "type": "car" },
  "parkingSpace": { "floorNumber": 1, "spaceNumber": 5 },
  "checkInTime": "2026-02-06T10:00:00Z"
}
```

### Check-Out
```javascript
POST /api/parking/checkout
{ "licensePlate": "XYZ789" }

Response:
{
  "success": true,
  "vehicle": { "licensePlate": "XYZ789", "type": "car" },
  "feeDetails": {
    "durationMinutes": 120,
    "hourlyRate": 3.0,
    "finalFee": 6.00
  }
}
```

## 🚗 Supported Vehicle Types

| Type | Space Required | Hourly Rate |
|------|-----------------|-------------|
| Motorcycle | 1 | $1.50 |
| Car | 1 | $3.00 |
| SUV | 2 | $4.50 |
| Bus | 3 | $6.00 |

## 🔧 Configuration

### Environment Variables
```
PORT=5000                          # Server port
NODE_ENV=development              # Environment
DATABASE_PATH=./parking_lot.db    # Database location
```

## 📞 Support

For issues or questions, please contact the development team or refer to the API documentation.

## 📄 License

This project is proprietary and confidential.

## 👨‍💻 Development

### Adding New Features

1. **Backend**: Add logic in services layer
2. **Frontend**: Create new components and integrate with API
3. **Database**: Update schema if needed
4. **Tests**: Add corresponding test cases

### Code Standards
- Use descriptive names for functions and variables
- Add JSDoc comments for complex logic
- Keep functions focused and single-purpose
- Handle errors gracefully with meaningful messages

---

**Last Updated**: February 6, 2026
#   p a r k i n g l o t  
 