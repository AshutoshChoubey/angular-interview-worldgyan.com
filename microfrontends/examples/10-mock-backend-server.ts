/**
 * @file 10-mock-backend-server.ts
 * @description Enterprise Node.js / Express Telemetry & Mock API Service (Port 3000)
 * 
 * Features:
 * - Strict multi-origin CORS (Ports 4200, 4201, 4202, 4203)
 * - JWT authentication & RBAC middleware
 * - REST endpoints for faults, topology mesh, and theme/locale sync
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3000;
const JWT_SECRET = 'enterprise-telemetry-secret-key-2026';

app.use(express.json());

const ALLOWED_ORIGINS = [
  'http://localhost:4200', // Shell Host
  'http://localhost:4201', // Fault Management MFE
  'http://localhost:4202', // Topology Manager MFE
  'http://localhost:4203'  // Angular Elements Widgets
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// In-Memory Database Simulation
interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  roles: string[];
  permissions: string[];
}

let userSettingsDatabase: Record<string, { theme: 'light' | 'dark'; language: string }> = {
  'usr-principal-01': { theme: 'dark', language: 'en' }
};

const SAMPLE_FAULTS = [
  { id: 'ALM-8012', entity: 'core-router-01.us-east', severity: 'CRITICAL', message: 'BGP Peer Session Terminated - AS64512', timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(), ack: false },
  { id: 'ALM-8013', entity: 'switch-spine-04.us-east', severity: 'MAJOR', message: 'Buffer Congestion Drop Threshold Exceeded (>85%)', timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), ack: false },
  { id: 'ALM-8014', entity: 'edge-gateway-02.eu-west', severity: 'CRITICAL', message: 'IPSec Tunnel Down - Remote Gateway Unreachable', timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), ack: true },
  { id: 'ALM-8015', entity: 'k8s-ingress-pool-a', severity: 'MINOR', message: 'TLS Certificate Expiry within 7 Days', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), ack: false },
  { id: 'ALM-8016', entity: 'db-replica-eu-01', severity: 'WARNING', message: 'Replication Lag Exceeded 450ms Threshold', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), ack: true }
];

const SAMPLE_CLUSTERS = [
  { clusterId: 'cluster-core-east', name: 'US-East Production Core Spine', region: 'us-east-1', healthStatus: 'DEGRADED', totalNodes: 32, activeNodes: 30, healthyPercentage: 93.75, throughputGbps: 184.2 },
  { clusterId: 'cluster-edge-eu', name: 'EU-West Sovereign Edge Gateway', region: 'eu-west-1', healthStatus: 'HEALTHY', totalNodes: 16, activeNodes: 16, healthyPercentage: 100.0, throughputGbps: 82.5 },
  { clusterId: 'cluster-compute-apac', name: 'APAC Distributed Worker Mesh', region: 'ap-southeast-1', healthStatus: 'HEALTHY', totalNodes: 64, activeNodes: 63, healthyPercentage: 98.4, throughputGbps: 340.8 }
];

const SAMPLE_NODES = [
  { id: 'node-ce-01', clusterId: 'cluster-core-east', ip: '10.240.12.1', role: 'SPINE_SWITCH', status: 'ONLINE', cpuLoad: 42, memoryUsed: 68 },
  { id: 'node-ce-02', clusterId: 'cluster-core-east', ip: '10.240.12.2', role: 'CORE_ROUTER', status: 'DEGRADED', cpuLoad: 89, memoryUsed: 91 },
  { id: 'node-ce-03', clusterId: 'cluster-core-east', ip: '10.240.12.3', role: 'LEAF_SWITCH', status: 'ONLINE', cpuLoad: 28, memoryUsed: 54 },
  { id: 'node-eu-01', clusterId: 'cluster-edge-eu', ip: '10.180.4.1', role: 'INGRESS_FIREWALL', status: 'ONLINE', cpuLoad: 33, memoryUsed: 49 }
];

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  user?: UserProfile;
}

const authenticateJwt = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Missing Bearer token' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: 'Token verification failed or expired' });
      return;
    }
    req.user = decoded as UserProfile;
    next();
  });
};

// Endpoints
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    const userPayload: UserProfile = {
      id: 'usr-principal-01',
      username: 'admin',
      fullName: 'Ashutosh Choubey (Principal Architect)',
      roles: ['PLATFORM_ADMIN', 'NET_OPS_LEAD'],
      permissions: ['telemetry:read', 'faults:write', 'topology:admin']
    };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: userPayload });
    return;
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/auth/me', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

app.get('/api/user/settings', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'usr-principal-01';
  res.json(userSettingsDatabase[userId] || { theme: 'dark', language: 'en' });
});

app.put('/api/user/settings', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'usr-principal-01';
  const { theme, language } = req.body;
  userSettingsDatabase[userId] = {
    theme: theme || userSettingsDatabase[userId]?.theme || 'dark',
    language: language || userSettingsDatabase[userId]?.language || 'en'
  };
  res.json({ success: true, settings: userSettingsDatabase[userId] });
});

app.get('/api/faults', authenticateJwt, (req: Request, res: Response) => {
  const severity = (req.query['severity'] as string)?.toUpperCase();
  if (severity && severity !== 'ALL') {
    res.json(SAMPLE_FAULTS.filter(f => f.severity === severity));
    return;
  }
  res.json(SAMPLE_FAULTS);
});

app.get('/api/topology/clusters', authenticateJwt, (_req: Request, res: Response) => {
  res.json(SAMPLE_CLUSTERS);
});

app.get('/api/topology/nodes', authenticateJwt, (req: Request, res: Response) => {
  const clusterId = req.query['clusterId'] as string;
  if (clusterId) {
    res.json(SAMPLE_NODES.filter(n => n.clusterId === clusterId));
    return;
  }
  res.json(SAMPLE_NODES);
});

app.listen(PORT, () => {
  console.log(`[Enterprise Mock API] Running on http://localhost:${PORT}`);
});
