import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { mockAPI, materialTypes } from '../../mock';
import { 
  Package, 
  TrendingUp, 
  Factory, 
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

const MaterialDashboard = () => {
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const data = await mockAPI.getMaterials();
      setMaterials(data);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalMaterials = () => materials.length;

  const getMaterialsByType = () => {
    const counts = materials.reduce((acc, material) => {
      acc[material.materialType] = (acc[material.materialType] || 0) + 1;
      return acc;
    }, {});
    
    return materialTypes.map(type => ({
      ...type,
      count: counts[type.value] || 0
    }));
  };

  const getActiveCount = () => materials.filter(m => m.status === 'active').length;
  const getInactiveCount = () => materials.filter(m => m.status === 'inactive').length;

  const getPlantDistribution = () => {
    const counts = materials.reduce((acc, material) => {
      acc[material.plant] = (acc[material.plant] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([plant, count]) => ({ plant, count }));
  };

  const getRecentMaterials = () => {
    return materials
      .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
      .slice(0, 5);
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue" }) => (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <div className={`flex items-center mt-1 text-sm ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
              }`}>
                {trend === 'up' ? <ArrowUp className="h-3 w-3 mr-1" /> :
                 trend === 'down' ? <ArrowDown className="h-3 w-3 mr-1" /> :
                 <Minus className="h-3 w-3 mr-1" />}
                {trendValue}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900`}>
            <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TypeDistributionCard = ({ types }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Material Type Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {types.map(type => (
            <div key={type.value} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="min-w-[60px] justify-center">
                  {type.value}
                </Badge>
                <span className="text-sm">{type.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(type.count / Math.max(...types.map(t => t.count), 1)) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium min-w-[20px]">{type.count}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-8 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Materials"
          value={getTotalMaterials()}
          icon={Package}
          trend="up"
          trendValue="+12% from last month"
          color="blue"
        />
        <StatCard
          title="Active Materials"
          value={getActiveCount()}
          icon={TrendingUp}
          trend="up"
          trendValue="+5% from last week"
          color="green"
        />
        <StatCard
          title="Inactive Materials"
          value={getInactiveCount()}
          icon={Factory}
          trend="down"
          trendValue="-2% from last week"
          color="orange"
        />
        <StatCard
          title="Plants Active"
          value={getPlantDistribution().length}
          icon={BarChart3}
          trend="stable"
          trendValue="No change"
          color="purple"
        />
      </div>

      {/* Material Type Distribution and Recent Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TypeDistributionCard types={getMaterialsByType()} />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recent Materials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getRecentMaterials().length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No materials created yet
                </p>
              ) : (
                getRecentMaterials().map(material => (
                  <div key={material.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{material.materialNumber}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {material.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {material.materialType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {material.createdDate}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plant Distribution */}
      {getPlantDistribution().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5" />
              Plant Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getPlantDistribution().map(({ plant, count }) => (
                <div key={plant} className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground">Plant {plant}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MaterialDashboard;