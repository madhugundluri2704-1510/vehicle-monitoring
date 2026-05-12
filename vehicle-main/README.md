# 🏛️ KMC SwachthTrack

**Kurnool Municipal Corporation Smart Cleaning Vehicle Monitoring System**

A real-time web application for Kurnool Municipal Corporation to monitor cleaning and garbage collection vehicles operating across the city.

## 🌟 Features

- **📍 Real-Time Vehicle Tracking** - Live GPS tracking of 40+ cleaning vehicles on Kurnool map
- **♻️ Waste Collection Monitoring** - Track wet, dry, hazardous waste by zone and ward
- **🗺️ Zone-Based Route Management** - 10 cleaning zones, 50 wards, 3 dumping yards
- **👷 Driver Management** - CRUD operations, shift management, performance tracking
- **🚛 Vehicle Fleet Management** - Full CRUD with type, container, zone assignment
- **📊 Analytics Dashboard** - Zone-wise waste charts, performance radar, container utilization
- **📋 Reports & Export** - Fleet summary, waste collection, alert analysis, CSV export
- **🔔 Smart Alerts** - Overspeed, overload, fuel-low, missed-area, route-deviation alerts
- **🌙 Dark/Light Mode** - Municipal green theme with responsive design
- **🔐 JWT Authentication** - Role-based access (Admin, Supervisor, Operator)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 8, Zustand, Recharts, Leaflet, React Router 7 |
| **Backend** | Node.js, Express 5, Socket.IO 4 |
| **Database** | MongoDB (MongoMemoryServer for dev) |
| **Auth** | JWT (Access + Refresh tokens) |
| **Real-time** | Socket.IO WebSocket |
| **Maps** | Leaflet + OpenStreetMap |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation
```bash
# Install all dependencies
npm run install-all

# Start backend server (port 5000)
npm run dev

# In a new terminal - Start frontend (port 5173)
npm run client
```

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@kmc.gov.in | admin123 |
| **Supervisor** | supervisor@kmc.gov.in | user123 |

## 📊 Kurnool Coverage

- **10 Cleaning Zones** covering all wards
- **40 Sanitation Vehicles**: Garbage trucks, compactors, auto-tippers, road sweepers, water tankers
- **40 Drivers** with shift management (morning/afternoon/night)
- **25 Cleaning Routes** from localities to 3 dumping yards
- **25 Localities**: Bus Stand, Market Area, Gandhi Nagar, Nehru Nagar, Bellary Road, Old Town, and more

## 🏗️ Project Structure

```
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Sidebar, Header
│   │   ├── pages/          # Dashboard, Tracking, Routes, Analytics, Management
│   │   ├── store/          # Zustand stores (Vehicle, Driver, Auth, Alert, Theme)
│   │   ├── hooks/          # useSocket hook
│   │   ├── services/       # Axios API service
│   │   └── utils/          # Formatters and helpers
│   └── index.html
├── server/                 # Express + Socket.IO backend
│   ├── controllers/        # Vehicle, Route, Waste, Driver, Report, Alert, Auth
│   ├── models/             # Vehicle, Route, WasteCollection, Driver, Alert, Tracking, User
│   ├── routes/             # API route definitions
│   ├── socket/             # Real-time simulation engine
│   ├── seed/               # Kurnool-specific seed data
│   └── server.js           # Entry point
└── package.json
```

## 🌐 Deployment (Render)

### Backend
- Build: `cd server && npm install`
- Start: `cd server && node server.js`
- Environment: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`

### Frontend
- Build: `cd client && npm install && npm run build`
- Publish: `client/dist`

---

*Built for Kurnool Municipal Corporation 🏛️*
