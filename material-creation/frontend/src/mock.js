// Mock data for Material Creation Application

export const materialTypes = [
  { value: 'RAW', label: 'Raw Material' },
  { value: 'SEMI', label: 'Semi-Finished' },
  { value: 'FERT', label: 'Finished Product' },
  { value: 'HALB', label: 'Semi-Finished Product' },
  { value: 'ROH', label: 'Raw Material' },
  { value: 'HIBE', label: 'Operating Supplies' }
];

export const industrySectors = [
  { value: 'A', label: 'Automotive' },
  { value: 'C', label: 'Chemical' },
  { value: 'E', label: 'Electronics' },
  { value: 'M', label: 'Mechanical Engineering' },
  { value: 'P', label: 'Pharmaceutical' },
  { value: 'T', label: 'Textile' }
];

export const plants = [
  { value: '1000', label: 'Plant 1000 - Main Production' },
  { value: '2000', label: 'Plant 2000 - Assembly' },
  { value: '3000', label: 'Plant 3000 - Warehouse' }
];

export const storageLocations = [
  { value: '0001', label: 'Raw Materials Store' },
  { value: '0002', label: 'Production Store' },
  { value: '0003', label: 'Finished Goods Store' }
];

export const baseUnits = [
  { value: 'KG', label: 'Kilogram' },
  { value: 'PC', label: 'Piece' },
  { value: 'M', label: 'Meter' },
  { value: 'L', label: 'Liter' },
  { value: 'M2', label: 'Square Meter' },
  { value: 'M3', label: 'Cubic Meter' }
];

export const valuationTypes = [
  { value: 'V', label: 'Moving Average' },
  { value: 'S', label: 'Standard Price' }
];

export const mrpTypes = [
  { value: 'PD', label: 'MRP' },
  { value: 'VV', label: 'Forecast-Based Planning' },
  { value: 'VM', label: 'Manual Reorder Point Planning' }
];

export const availableViews = [
  { id: 'basic1', label: 'Basic Data 1', category: 'basic' },
  { id: 'basic2', label: 'Basic Data 2', category: 'basic' },
  { id: 'classification', label: 'Classification', category: 'basic' },
  { id: 'sales1', label: 'Sales: Sales Org. Data 1', category: 'sales' },
  { id: 'sales2', label: 'Sales: Sales Org. Data 2', category: 'sales' },
  { id: 'salesGeneral', label: 'Sales: General/Plant Data', category: 'sales' },
  { id: 'purchasing', label: 'Purchasing', category: 'procurement' },
  { id: 'mrp1', label: 'MRP 1', category: 'planning' },
  { id: 'mrp2', label: 'MRP 2', category: 'planning' },
  { id: 'mrp3', label: 'MRP 3', category: 'planning' },
  { id: 'mrp4', label: 'MRP 4', category: 'planning' },
  { id: 'workScheduling', label: 'Work Scheduling', category: 'planning' },
  { id: 'plant', label: 'Plant/Storage', category: 'logistics' },
  { id: 'warehouse', label: 'Warehouse Mgmt', category: 'logistics' }
];

export const mockMaterials = [
  {
    id: '1',
    materialNumber: 'MAT001001',
    description: 'Steel Rod 10mm',
    materialType: 'RAW',
    industrySector: 'A',
    baseUnit: 'KG',
    plant: '1000',
    storageLocation: '0001',
    grossWeight: 15.5,
    volume: 0.025,
    status: 'active',
    createdDate: '2024-01-15',
    createdBy: 'System Admin'
  },
  {
    id: '2',
    materialNumber: 'MAT002001',
    description: 'Engine Block Semi-Finished',
    materialType: 'SEMI',
    industrySector: 'A',
    baseUnit: 'PC',
    plant: '2000',
    storageLocation: '0002',
    grossWeight: 45.2,
    volume: 0.15,
    status: 'active',
    createdDate: '2024-01-16',
    createdBy: 'Production Manager'
  },
  {
    id: '3',
    materialNumber: 'MAT003001',
    description: 'Complete Engine Assembly',
    materialType: 'FERT',
    industrySector: 'A',
    baseUnit: 'PC',
    plant: '2000',
    storageLocation: '0003',
    grossWeight: 125.8,
    volume: 0.45,
    status: 'active',
    createdDate: '2024-01-17',
    createdBy: 'Quality Manager'
  }
];

// Mock API functions
export const mockAPI = {
  getMaterials: () => Promise.resolve(mockMaterials),
  
  createMaterial: (materialData) => {
    const newMaterial = {
      id: Date.now().toString(),
      materialNumber: `MAT${Date.now()}`,
      ...materialData,
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
      createdBy: 'Current User'
    };
    mockMaterials.push(newMaterial);
    return Promise.resolve(newMaterial);
  },
  
  updateMaterial: (id, materialData) => {
    const index = mockMaterials.findIndex(m => m.id === id);
    if (index !== -1) {
      mockMaterials[index] = { ...mockMaterials[index], ...materialData };
      return Promise.resolve(mockMaterials[index]);
    }
    return Promise.reject(new Error('Material not found'));
  },
  
  deleteMaterial: (id) => {
    const index = mockMaterials.findIndex(m => m.id === id);
    if (index !== -1) {
      mockMaterials.splice(index, 1);
      return Promise.resolve();
    }
    return Promise.reject(new Error('Material not found'));
  }
};