import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useToast } from '../../hooks/use-toast';
import { 
  materialTypes, 
  industrySectors, 
  plants, 
  storageLocations, 
  baseUnits,
  valuationTypes,
  mrpTypes,
  availableViews,
  mockAPI 
} from '../../mock';
import { 
  Package, 
  Factory, 
  Settings, 
  CheckCircle,
  Save,
  X,
  Plus,
  FileText,
  Layers,
  MapPin
} from 'lucide-react';

const MaterialForm = ({ material, onSave, onCancel, mode = 'create' }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    description: material?.description || '',
    materialType: material?.materialType || '',
    industrySector: material?.industrySector || '',
    plant: material?.plant || '',
    storageLocation: material?.storageLocation || '',
    baseUnit: material?.baseUnit || '',
    grossWeight: material?.grossWeight || '',
    volume: material?.volume || '',
    valuationType: material?.valuationType || '',
    mrpType: material?.mrpType || '',
    batchManagement: material?.batchManagement || false,
    serialNumbers: material?.serialNumbers || false,
    ...material
  });

  const [selectedViews, setSelectedViews] = useState(
    material?.selectedViews || ['basic1', 'plant']
  );
  
  const [activeTab, setActiveTab] = useState('views');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleViewToggle = (viewId) => {
    setSelectedViews(prev => 
      prev.includes(viewId)
        ? prev.filter(id => id !== viewId)
        : [...prev, viewId]
    );
  };

  const handleSubmit = async () => {
    if (!formData.description || !formData.materialType || !formData.industrySector) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Description, Material Type, Industry Sector)",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const materialData = {
        ...formData,
        selectedViews
      };

      let result;
      if (mode === 'create') {
        result = await mockAPI.createMaterial(materialData);
      } else {
        result = await mockAPI.updateMaterial(material.id, materialData);
      }

      toast({
        title: "Success",
        description: `Material ${mode === 'create' ? 'created' : 'updated'} successfully`,
      });

      onSave(result);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${mode} material: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const groupedViews = availableViews.reduce((acc, view) => {
    if (!acc[view.category]) acc[view.category] = [];
    acc[view.category].push(view);
    return acc;
  }, {});

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Package className="h-6 w-6" />
            {mode === 'create' ? 'Create Material' : 'Edit Material'}
            {formData.description && (
              <span className="text-lg font-normal text-muted-foreground">
                - {formData.description}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="views" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Select View(s)
              </TabsTrigger>
              <TabsTrigger value="orgLevels" className="flex items-center gap-2">
                <Factory className="h-4 w-4" />
                Org. Levels
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="views" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Material Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Material Description *</Label>
                      <Input
                        id="description"
                        placeholder="Enter material description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="materialType">Material Type *</Label>
                        <Select 
                          value={formData.materialType} 
                          onValueChange={(value) => handleInputChange('materialType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {materialTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industrySector">Industry Sector *</Label>
                        <Select 
                          value={formData.industrySector} 
                          onValueChange={(value) => handleInputChange('industrySector', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select sector" />
                          </SelectTrigger>
                          <SelectContent>
                            {industrySectors.map(sector => (
                              <SelectItem key={sector.value} value={sector.value}>
                                {sector.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Available Views</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(groupedViews).map(([category, views]) => (
                        <div key={category} className="space-y-2">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                            {category}
                          </h4>
                          <div className="space-y-2">
                            {views.map(view => (
                              <div key={view.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={view.id}
                                  checked={selectedViews.includes(view.id)}
                                  onCheckedChange={() => handleViewToggle(view.id)}
                                />
                                <Label 
                                  htmlFor={view.id}
                                  className="text-sm cursor-pointer"
                                >
                                  {view.label}
                                </Label>
                              </div>
                            ))}
                          </div>
                          <Separator />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Selected Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedViews.map(viewId => {
                      const view = availableViews.find(v => v.id === viewId);
                      return view ? (
                        <Badge key={viewId} variant="secondary" className="flex items-center gap-1">
                          {view.label}
                          <button
                            onClick={() => handleViewToggle(viewId)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                    {selectedViews.length === 0 && (
                      <span className="text-muted-foreground text-sm">No views selected</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orgLevels" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Organizational Levels
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="plant">Plant</Label>
                      <Select 
                        value={formData.plant} 
                        onValueChange={(value) => handleInputChange('plant', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select plant" />
                        </SelectTrigger>
                        <SelectContent>
                          {plants.map(plant => (
                            <SelectItem key={plant.value} value={plant.value}>
                              {plant.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storageLocation">Storage Location</Label>
                      <Select 
                        value={formData.storageLocation} 
                        onValueChange={(value) => handleInputChange('storageLocation', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {storageLocations.map(location => (
                            <SelectItem key={location.value} value={location.value}>
                              {location.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valuationType">Valuation Type</Label>
                      <Select 
                        value={formData.valuationType} 
                        onValueChange={(value) => handleInputChange('valuationType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select valuation type" />
                        </SelectTrigger>
                        <SelectContent>
                          {valuationTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>MRP Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="mrpType">MRP Type</Label>
                      <Select 
                        value={formData.mrpType} 
                        onValueChange={(value) => handleInputChange('mrpType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select MRP type" />
                        </SelectTrigger>
                        <SelectContent>
                          {mrpTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="batchManagement"
                          checked={formData.batchManagement}
                          onCheckedChange={(checked) => handleInputChange('batchManagement', checked)}
                        />
                        <Label htmlFor="batchManagement">Batch Management</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="serialNumbers"
                          checked={formData.serialNumbers}
                          onCheckedChange={(checked) => handleInputChange('serialNumbers', checked)}
                        />
                        <Label htmlFor="serialNumbers">Serial Numbers</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="data" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>General Data</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="baseUnit">Base Unit of Measure</Label>
                      <Select 
                        value={formData.baseUnit} 
                        onValueChange={(value) => handleInputChange('baseUnit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {baseUnits.map(unit => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="grossWeight">Gross Weight</Label>
                        <Input
                          id="grossWeight"
                          type="number"
                          placeholder="0.000"
                          value={formData.grossWeight}
                          onChange={(e) => handleInputChange('grossWeight', parseFloat(e.target.value) || '')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="volume">Volume</Label>
                        <Input
                          id="volume"
                          type="number"
                          placeholder="0.000"
                          value={formData.volume}
                          onChange={(e) => handleInputChange('volume', parseFloat(e.target.value) || '')}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Material Status</h4>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Ready for creation</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Selected Views:</strong> {selectedViews.length}</p>
                      <p><strong>Material Type:</strong> {materialTypes.find(t => t.value === formData.materialType)?.label || 'Not selected'}</p>
                      <p><strong>Plant:</strong> {plants.find(p => p.value === formData.plant)?.label || 'Not selected'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isLoading || !formData.description || !formData.materialType}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <Settings className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {mode === 'create' ? 'Create Material' : 'Update Material'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaterialForm;