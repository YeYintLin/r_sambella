/**
 * Mock Data for Royal Shambella CRM Dashboard
 * Design: Dark Theme with Yellow/Gold Accents
 */

export interface KPIData {
  totalLeads: number;
  wonOpportunities: number;
  conversionRate: number;
  weightedPipeline: number;
  wonRevenue: number;
  openOpportunities: number;
  idleOpportunities: number;
  slaCompliance: number;
}

export interface ProductionTrendData {
  date: string;
  lemongrass: number;
  gingerFlower: number;
  sandalwood: number;
  lavender: number;
  tropical: number;
}

export interface MachineMetric {
  name: string;
  uptime: number;
  status: 'running' | 'idle' | 'error';
  lastUpdated: Date;
}

export interface ManufacturingOrder {
  id: string;
  product: string;
  scent: string;
  quantity: number;
  stage: 'Draft' | 'Confirmed' | 'To Close';
  progress: number;
  createdDate: Date;
}

// KPI Data for Royal Shambella
export const kpiData: KPIData = {
  totalLeads: 10,
  wonOpportunities: 11,
  conversionRate: 110,
  weightedPipeline: 3600000,
  wonRevenue: 122800000,
  openOpportunities: 4,
  idleOpportunities: 4,
  slaCompliance: 95,
};

// Production Trend Data (Last 7 days)
export const productionTrendData: ProductionTrendData[] = [
  {
    date: 'Mon',
    lemongrass: 240,
    gingerFlower: 180,
    sandalwood: 150,
    lavender: 220,
    tropical: 190,
  },
  {
    date: 'Tue',
    lemongrass: 280,
    gingerFlower: 200,
    sandalwood: 170,
    lavender: 240,
    tropical: 210,
  },
  {
    date: 'Wed',
    lemongrass: 320,
    gingerFlower: 220,
    sandalwood: 190,
    lavender: 260,
    tropical: 230,
  },
  {
    date: 'Thu',
    lemongrass: 290,
    gingerFlower: 210,
    sandalwood: 180,
    lavender: 250,
    tropical: 220,
  },
  {
    date: 'Fri',
    lemongrass: 350,
    gingerFlower: 240,
    sandalwood: 200,
    lavender: 280,
    tropical: 250,
  },
  {
    date: 'Sat',
    lemongrass: 310,
    gingerFlower: 230,
    sandalwood: 190,
    lavender: 270,
    tropical: 240,
  },
  {
    date: 'Sun',
    lemongrass: 280,
    gingerFlower: 200,
    sandalwood: 170,
    lavender: 240,
    tropical: 210,
  },
];

// Machine Metrics
export const machineMetrics: MachineMetric[] = [
  {
    name: 'Filling Machine A',
    uptime: 92,
    status: 'running',
    lastUpdated: new Date(),
  },
  {
    name: 'Labeling Station 1',
    uptime: 85,
    status: 'running',
    lastUpdated: new Date(),
  },
];

// Manufacturing Orders
export const manufacturingOrders: ManufacturingOrder[] = [
  {
    id: 'ORD-001',
    product: 'Reed Diffuser 50ml',
    scent: 'Lemongrass',
    quantity: 500,
    stage: 'Confirmed',
    progress: 75,
    createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'ORD-002',
    product: 'Car Freshener',
    scent: 'Lavender',
    quantity: 1200,
    stage: 'To Close',
    progress: 95,
    createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'ORD-003',
    product: 'Aromatherapy Oil 30ml',
    scent: 'Sandalwood',
    quantity: 300,
    stage: 'Draft',
    progress: 20,
    createdDate: new Date(),
  },
  {
    id: 'ORD-004',
    product: 'Reed Diffuser 100ml',
    scent: 'Ginger Flower',
    quantity: 800,
    stage: 'Confirmed',
    progress: 50,
    createdDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'ORD-005',
    product: 'Car Freshener',
    scent: 'Tropical',
    quantity: 600,
    stage: 'To Close',
    progress: 88,
    createdDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
];

// Pipeline opportunities data
export const pipelineData = [
  { name: 'Monthly Retainer (BPO / Operations)', value: 6 },
  { name: 'Project-Based Services', value: 4 },
];

// Stage distribution data
export const stageDistributionData = [
  { name: 'Inquiry Received', value: 35, fill: '#FFC107' },
  { name: 'Discovery Completed', value: 25, fill: '#FFD54F' },
  { name: 'Cancel', value: 20, fill: '#808080' },
  { name: 'Active', value: 15, fill: '#00C853' },
];

// Last sync timestamp
export const lastSyncTime = new Date(Date.now() - 5 * 60 * 1000);
