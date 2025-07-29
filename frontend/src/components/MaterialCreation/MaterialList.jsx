import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { useToast } from '../../hooks/use-toast';
import { mockAPI, materialTypes, industrySectors, plants } from '../../mock';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Filter,
  Calendar,
  User
} from 'lucide-react';

const MaterialList = ({ onCreateNew, onEdit }) => {
  const { toast } = useToast();
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [materials, searchTerm]);

  const loadMaterials = async () => {
    try {
      setIsLoading(true);
      const data = await mockAPI.getMaterials();
      setMaterials(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load materials",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterMaterials = () => {
    if (!searchTerm) {
      setFilteredMaterials(materials);
    } else {
      const filtered = materials.filter(material =>
        material.materialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.materialType.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMaterials(filtered);
    }
  };

  const handleDelete = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      await mockAPI.deleteMaterial(materialId);
      setMaterials(prev => prev.filter(m => m.id !== materialId));
      toast({
        title: "Success",
        description: "Material deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete material",
        variant: "destructive"
      });
    }
  };

  const getMaterialTypeLabel = (value) => {
    const type = materialTypes.find(t => t.value === value);
    return type ? type.label : value;
  };

  const getIndustrySectorLabel = (value) => {
    const sector = industrySectors.find(s => s.value === value);
    return sector ? sector.label : value;
  };

  const getPlantLabel = (value) => {
    const plant = plants.find(p => p.value === value);
    return plant ? plant.label : value;
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      pending: 'outline'
    };
    return (
      <Badge variant={variants[status] || 'default'}>
        {status}
      </Badge>
    );
  };

  const getTypeBadge = (type) => {
    const colors = {
      RAW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      SEMI: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      FERT: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      HALB: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    
    return (
      <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>
        {getMaterialTypeLabel(type)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <Package className="h-8 w-8 animate-pulse mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading materials...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Package className="h-6 w-6" />
              Materials Management
            </CardTitle>
            <Button onClick={onCreateNew} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Material
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          {filteredMaterials.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-2">No Materials Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'No materials match your search criteria.' : 'Get started by creating your first material.'}
                </p>
                <Button onClick={onCreateNew} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Material
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material Number</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Plant</TableHead>
                    <TableHead>Base Unit</TableHead>
                    <TableHead>Weight (kg)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMaterials.map((material) => (
                    <TableRow key={material.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {material.materialNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{material.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(material.materialType)}
                      </TableCell>
                      <TableCell>
                        {getIndustrySectorLabel(material.industrySector)}
                      </TableCell>
                      <TableCell>
                        {getPlantLabel(material.plant)}
                      </TableCell>
                      <TableCell>{material.baseUnit}</TableCell>
                      <TableCell>{material.grossWeight}</TableCell>
                      <TableCell>
                        {getStatusBadge(material.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {material.createdDate}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {material.createdBy}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(material)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(material.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <div>
              Showing {filteredMaterials.length} of {materials.length} materials
            </div>
            <div>
              Total: {materials.length} materials
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaterialList;