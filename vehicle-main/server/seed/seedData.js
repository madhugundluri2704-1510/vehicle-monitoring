const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Route = require('../models/Route');
const WasteCollection = require('../models/WasteCollection');
const Alert = require('../models/Alert');
const { haversineDistance, generateWaypoints, estimateDuration } = require('../utils/geoUtils');

// Kurnool localities with coordinates
const kurnoolLocalities = [
  { name: 'Kurnool Bus Stand', lat: 15.8312, lng: 78.0422 },
  { name: 'Market Area', lat: 15.8290, lng: 78.0390 },
  { name: 'Gandhi Nagar', lat: 15.8350, lng: 78.0300 },
  { name: 'Nehru Nagar', lat: 15.8200, lng: 78.0450 },
  { name: 'Bellary Road', lat: 15.8150, lng: 78.0500 },
  { name: 'Old Town', lat: 15.8330, lng: 78.0480 },
  { name: 'Nandyal Road', lat: 15.8400, lng: 78.0250 },
  { name: 'Srisailam Road', lat: 15.8450, lng: 78.0550 },
  { name: 'Budawara Peta', lat: 15.8280, lng: 78.0520 },
  { name: 'Kallur', lat: 15.8100, lng: 78.0600 },
  { name: 'Kothapeta', lat: 15.8370, lng: 78.0350 },
  { name: 'Venkata Ramana Colony', lat: 15.8220, lng: 78.0280 },
  { name: 'Ashok Nagar', lat: 15.8180, lng: 78.0350 },
  { name: 'Raghavendra Nagar', lat: 15.8420, lng: 78.0400 },
  { name: 'Vidya Nagar', lat: 15.8260, lng: 78.0200 },
  { name: 'Sai Nagar', lat: 15.8140, lng: 78.0420 },
  { name: 'Balaji Nagar', lat: 15.8390, lng: 78.0580 },
  { name: 'Railway Station Area', lat: 15.8310, lng: 78.0460 },
  { name: 'Govt Hospital Area', lat: 15.8240, lng: 78.0380 },
  { name: 'Handri River Side', lat: 15.8080, lng: 78.0320 },
  { name: 'R&B Guest House Area', lat: 15.8340, lng: 78.0440 },
  { name: 'Stadium Road', lat: 15.8270, lng: 78.0310 },
  { name: 'Ulchala Road', lat: 15.8160, lng: 78.0480 },
  { name: 'Mosque Road', lat: 15.8300, lng: 78.0410 },
  { name: 'Corporation Office', lat: 15.8295, lng: 78.0405 },
];

// Dumping yards
const dumpingYards = [
  { name: 'Kurnool Municipal Dumping Yard', lat: 15.8450, lng: 78.0650 },
  { name: 'Orvakal Dump Site', lat: 15.7900, lng: 78.0800 },
  { name: 'Panyam Road Yard', lat: 15.8550, lng: 78.0200 },
];

// Cleaning zones
const cleaningZones = [
  'Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5',
  'Zone 6', 'Zone 7', 'Zone 8', 'Zone 9', 'Zone 10'
];

// Driver names (Telugu/Kurnool region)
const driverNames = [
  'Ramesh Reddy', 'Suresh Kumar', 'Venkatesh Naidu', 'Srinivas Rao', 'Ganesh Babu',
  'Rajendra Prasad', 'Manoj Kumar', 'Kiran Kumar', 'Ravi Shankar', 'Lakshmi Narayana',
  'Prasad Rao', 'Venkanna', 'Obulesu', 'Ramaiah', 'Nagesh',
  'Siva Prasad', 'Chandra Shekar', 'Bala Krishna', 'Madhu Babu', 'Tirupathi Rao',
  'Nagarjuna', 'Srikanth', 'Malla Reddy', 'Peda Venkaiah', 'Ankaiah',
  'Siddaiah', 'Rangaiah', 'Basavaiah', 'Lakshmaiah', 'Narasimha Reddy',
  'Hari Krishna', 'Gopal Reddy', 'Mohan Rao', 'Subrahmanyam', 'Yella Reddy',
  'Peddi Reddy', 'Siva Reddy', 'Ranga Reddy', 'Thimma Reddy', 'Chinna Obulesu',
];

const vehicleTypes = ['garbage-truck', 'mini-truck', 'auto-tipper', 'compactor', 'road-sweeper', 'water-tanker'];
const statuses = ['active', 'active', 'active', 'active', 'idle', 'idle', 'maintenance', 'offline'];
const containerTypes = ['240L-bin', '660L-bin', 'dumpster', 'open-container', 'compactor-bin'];
const wasteTypes = ['wet', 'dry', 'mixed', 'hazardous', 'construction'];
const collectionStatuses = ['pending', 'in-progress', 'in-progress', 'in-progress', 'completed', 'completed', 'completed', 'missed'];
const routeTypes = ['garbage-collection', 'garbage-collection', 'street-cleaning', 'drain-cleaning'];
const trafficConditions = ['clear', 'clear', 'moderate', 'moderate', 'heavy'];
const alertTypes = ['overspeed', 'overload', 'route-deviation', 'missed-area', 'delayed-collection', 'vehicle-breakdown', 'fuel-low', 'vehicle-offline', 'maintenance-due'];
const severities = ['low', 'medium', 'medium', 'high', 'critical'];
const shiftTimes = ['morning', 'morning', 'morning', 'afternoon', 'afternoon', 'night'];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateVehicleNumber = (index) => {
  const num = String(randomBetween(1000, 9999));
  const series = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `AP24${series}${num}`;
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting Kurnool Municipal Corporation database seed...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      Driver.deleteMany({}),
      Route.deleteMany({}),
      WasteCollection.deleteMany({}),
      Alert.deleteMany({}),
    ]);

    // Create admin user
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await User.create({
      username: 'KMC Admin',
      email: 'admin@kmc.gov.in',
      password: hashedPassword,
      role: 'admin',
      department: 'Sanitation',
      employeeId: 'KMC-001'
    });

    // Create supervisor
    const supervisorPass = await bcrypt.hash('user123', salt);
    await User.create({
      username: 'Supervisor',
      email: 'supervisor@kmc.gov.in',
      password: supervisorPass,
      role: 'supervisor',
      department: 'Sanitation',
      employeeId: 'KMC-002'
    });

    console.log('👤 Users created');

    // Create 40 drivers
    const drivers = [];
    for (let i = 0; i < 40; i++) {
      const driver = await Driver.create({
        driverName: driverNames[i],
        phoneNumber: `+91 ${randomBetween(70000, 99999)} ${randomBetween(10000, 99999)}`,
        aadharLast4: String(randomBetween(1000, 9999)),
        shiftTime: randomItem(shiftTimes),
        joiningDate: new Date(Date.now() - randomBetween(180, 1800) * 86400000),
        status: i < 35 ? 'active' : randomItem(['active', 'on-leave']),
        performanceScore: randomBetween(55, 98),
        address: `${randomItem(kurnoolLocalities).name}, Kurnool`,
        emergencyContact: `+91 ${randomBetween(70000, 99999)} ${randomBetween(10000, 99999)}`,
        totalTrips: randomBetween(100, 2000),
        totalWasteCollected: randomBetween(50000, 500000),
        attendanceCount: randomBetween(200, 350),
        absentCount: randomBetween(5, 40),
      });
      drivers.push(driver);
    }
    console.log('👷 40 drivers created');

    // Create 25 routes
    const routes = [];
    for (let i = 0; i < 25; i++) {
      const srcLocality = kurnoolLocalities[i % kurnoolLocalities.length];
      const dstYard = dumpingYards[i % dumpingYards.length];
      const dist = haversineDistance(srcLocality.lat, srcLocality.lng, dstYard.lat, dstYard.lng);
      const waypoints = generateWaypoints(srcLocality, dstYard, randomBetween(5, 10));
      const zone = cleaningZones[i % cleaningZones.length];

      const route = await Route.create({
        routeName: `${srcLocality.name} → ${dstYard.name}`,
        cleaningZone: zone,
        wardNumber: randomBetween(1, 50),
        routeType: randomItem(routeTypes),
        source: { name: srcLocality.name, lat: srcLocality.lat, lng: srcLocality.lng },
        destination: { name: dstYard.name, lat: dstYard.lat, lng: dstYard.lng },
        dumpingYard: { name: dstYard.name, lat: dstYard.lat, lng: dstYard.lng },
        checkpoints: [{
          name: `Checkpoint ${i + 1}`,
          lat: (srcLocality.lat + dstYard.lat) / 2 + (Math.random() - 0.5) * 0.01,
          lng: (srcLocality.lng + dstYard.lng) / 2 + (Math.random() - 0.5) * 0.01
        }],
        waypoints,
        distance: Math.round(dist * 1.3 * 10) / 10,
        estimatedDuration: estimateDuration(dist * 1.3),
        trafficCondition: randomItem(trafficConditions),
        status: randomItem(['active', 'active', 'completed', 'planned'])
      });
      routes.push(route);
    }
    console.log('🛣️  25 cleaning routes created');

    // Create 40 vehicles
    const vehicles = [];
    for (let i = 0; i < 40; i++) {
      const route = routes[i % routes.length];
      const driver = drivers[i];
      const status = randomItem(statuses);
      const zone = cleaningZones[i % cleaningZones.length];
      const progress = Math.random();
      const srcLat = route.source.lat;
      const srcLng = route.source.lng;
      const dstLat = route.destination.lat;
      const dstLng = route.destination.lng;

      const currentLat = srcLat + (dstLat - srcLat) * progress + (Math.random() - 0.5) * 0.008;
      const currentLng = srcLng + (dstLng - srcLng) * progress + (Math.random() - 0.5) * 0.008;
      const loadCap = randomBetween(3000, 10000);

      const vehicle = await Vehicle.create({
        vehicleNumber: generateVehicleNumber(i),
        vehicleType: randomItem(vehicleTypes),
        assignedDriver: driver._id,
        driverName: driver.driverName,
        driverPhone: driver.phoneNumber,
        status,
        cleaningZone: zone,
        wardNumber: randomBetween(1, 50),
        currentLocation: { lat: currentLat, lng: currentLng },
        fuelLevel: randomBetween(15, 100),
        speed: status === 'active' ? randomBetween(10, 40) : 0,
        loadCapacity: loadCap,
        currentLoadWeight: status === 'active' ? randomBetween(500, loadCap) : 0,
        wasteType: randomItem(wasteTypes),
        containerType: randomItem(containerTypes),
        mileage: randomBetween(5000, 120000),
        lastMaintenance: new Date(Date.now() - randomBetween(1, 60) * 86400000),
        nextMaintenanceDue: new Date(Date.now() + randomBetween(5, 60) * 86400000),
        assignedRoute: route._id,
        heading: randomBetween(0, 360),
        engineTemp: randomBetween(70, 100),
        idleTime: status === 'idle' ? randomBetween(5, 60) : 0,
        registrationYear: randomBetween(2018, 2025)
      });
      vehicles.push(vehicle);

      // Update driver with assigned vehicle
      await Driver.findByIdAndUpdate(driver._id, { assignedVehicle: vehicle._id });

      // Update route with assigned vehicle
      if (i < 25) {
        await Route.findByIdAndUpdate(route._id, { assignedVehicle: vehicle._id });
      }
    }
    console.log('🚛 40 municipality vehicles created');

    // Create 60 waste collection records
    for (let i = 0; i < 60; i++) {
      const vehicle = vehicles[i % vehicles.length];
      const route = routes[i % routes.length];
      const wType = randomItem(wasteTypes);
      const cStatus = randomItem(collectionStatuses);

      await WasteCollection.create({
        collectionId: `WC-${String(i + 1).padStart(4, '0')}`,
        vehicleId: vehicle._id,
        routeId: route._id,
        wasteType: wType,
        loadWeight: randomBetween(200, 5000),
        containerType: randomItem(containerTypes),
        collectionStatus: cStatus,
        cleaningZone: cleaningZones[i % cleaningZones.length],
        wardNumber: randomBetween(1, 50),
        households: randomBetween(50, 500),
        collectedAt: cStatus !== 'pending' ? new Date(Date.now() - randomBetween(0, 48) * 3600000) : null,
        dumpedAt: cStatus === 'completed' ? new Date(Date.now() - randomBetween(0, 24) * 3600000) : null,
        dumpingYard: dumpingYards[i % dumpingYards.length].name,
      });
    }
    console.log('♻️  60 waste collection records created');

    // Create alerts
    for (let i = 0; i < 25; i++) {
      const vehicle = vehicles[randomBetween(0, 39)];
      const type = randomItem(alertTypes);
      const messages = {
        'overspeed': `${vehicle.vehicleNumber} exceeding speed limit at ${randomBetween(45, 70)} km/h in residential area`,
        'overload': `${vehicle.vehicleNumber} waste load ${randomBetween(5000, 8000)}kg exceeds ${vehicle.loadCapacity}kg capacity`,
        'route-deviation': `${vehicle.vehicleNumber} deviated from assigned cleaning route in ${vehicle.cleaningZone}`,
        'missed-area': `${vehicle.vehicleNumber} missed scheduled cleaning area in Ward ${randomBetween(1, 50)}`,
        'delayed-collection': `${vehicle.vehicleNumber} delayed waste collection by ${randomBetween(30, 120)} minutes`,
        'vehicle-breakdown': `${vehicle.vehicleNumber} reported mechanical failure near ${randomItem(kurnoolLocalities).name}`,
        'fuel-low': `${vehicle.vehicleNumber} fuel level critically low at ${randomBetween(3, 14)}%`,
        'vehicle-offline': `${vehicle.vehicleNumber} went offline - no GPS signal for ${randomBetween(5, 30)} minutes`,
        'maintenance-due': `${vehicle.vehicleNumber} maintenance overdue by ${randomBetween(5, 20)} days`,
      };

      await Alert.create({
        vehicleId: vehicle._id,
        type,
        severity: randomItem(severities),
        message: messages[type],
        location: vehicle.currentLocation,
        cleaningZone: vehicle.cleaningZone,
        acknowledged: Math.random() > 0.6,
        createdAt: new Date(Date.now() - randomBetween(0, 72) * 3600000)
      });
    }
    console.log('🚨 25 alerts created');

    console.log('\n✅ Kurnool Municipal Corporation database seeded successfully!');
    console.log('🏛️  Admin login: admin@kmc.gov.in / admin123');
    console.log('👷 Supervisor login: supervisor@kmc.gov.in / user123\n');

  } catch (error) {
    console.error('❌ Seed error:', error.message);
    throw error;
  }
};

module.exports = { seedDatabase };
