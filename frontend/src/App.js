import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from './components/ui/toaster';
import MaterialDashboard from './components/MaterialCreation/MaterialDashboard';
import MaterialList from './components/MaterialCreation/MaterialList';
import MaterialForm from './components/MaterialCreation/MaterialForm';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { 
  Package, 
  Plus, 
  List, 
  BarChart3, 
  ArrowLeft,
  Settings,
  Home
} from 'lucide-react';

const Navigation = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'list', label: 'Materials', icon: List },
    { id: 'create', label: 'Create', icon: Plus }
  ];

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">MaterialPro</h1>
            </div>
            <div className="flex items-center space-x-1">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? "default" : "ghost"}
                    onClick={() => onViewChange(item.id)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const WelcomeScreen = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="max-w-2xl w-full shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <Package className="h-12 w-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome to MaterialPro
            </CardTitle>
            <p className="text-muted-foreground text-lg mt-2">
              Complete Manufacturing Material Creation & Management System
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold">Raw Materials</h3>
                <p className="text-sm text-muted-foreground">Manage raw material inventory</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <Settings className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <h3 className="font-semibold">Semi-Finished</h3>
                <p className="text-sm text-muted-foreground">Track production stages</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold">Finished Products</h3>
                <p className="text-sm text-muted-foreground">Complete product management</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Key Features:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Multi-level material hierarchy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Plant & warehouse management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>MRP integration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Batch & serial tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Real-time analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span>Industry-specific configurations</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Home className="h-5 w-5 mr-2" />
                Get Started
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const MainApp = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [editingMaterial, setEditingMaterial] = useState(null);

  const handleCreateNew = () => {
    setEditingMaterial(null);
    setCurrentView('create');
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setCurrentView('create');
  };

  const handleSave = () => {
    setEditingMaterial(null);
    setCurrentView('list');
  };

  const handleCancel = () => {
    setEditingMaterial(null);
    setCurrentView('list');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <MaterialDashboard />;
      case 'list':
        return (
          <MaterialList 
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
          />
        );
      case 'create':
        return (
          <MaterialForm
            material={editingMaterial}
            mode={editingMaterial ? 'edit' : 'create'}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        );
      default:
        return <MaterialDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView}
      />
      <main className="py-6">
        {renderContent()}
      </main>
      <Toaster />
    </div>
  );
};

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  if (showWelcome) {
    return <WelcomeScreen onGetStarted={() => setShowWelcome(false)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;