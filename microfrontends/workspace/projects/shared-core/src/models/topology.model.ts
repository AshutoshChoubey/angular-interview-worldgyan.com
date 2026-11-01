export interface TopologyCluster {
  clusterId: string;
  name: string;
  region: string;
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  totalNodes: number;
  activeNodes: number;
  healthyPercentage: number;
  throughputGbps: number;
}

export interface TopologyNode {
  id: string;
  clusterId: string;
  ip: string;
  role: string;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  cpuLoad: number;
  memoryUsed: number;
}
