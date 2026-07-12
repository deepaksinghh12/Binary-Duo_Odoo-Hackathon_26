import React from 'react';
import { PageHeader } from '../../../components/common/PageHeader';
import { Card } from '../../../components/common/Card';

export const EnvironmentalOverview: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader 
        title="Environmental Overview" 
        description="High-level summary of your organization's environmental impact."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="flex flex-col justify-center">
          <h3 className="text-slate-500 font-medium text-sm">Total Scope 1</h3>
          <p className="text-3xl font-bold text-[#0D3B3E] mt-2">12,450 <span className="text-lg text-slate-400 font-normal">tCO2e</span></p>
        </Card>
        <Card className="flex flex-col justify-center">
          <h3 className="text-slate-500 font-medium text-sm">Total Scope 2</h3>
          <p className="text-3xl font-bold text-[#0D3B3E] mt-2">8,920 <span className="text-lg text-slate-400 font-normal">tCO2e</span></p>
        </Card>
        <Card className="flex flex-col justify-center">
          <h3 className="text-slate-500 font-medium text-sm">Total Scope 3</h3>
          <p className="text-3xl font-bold text-[#0D3B3E] mt-2">45,100 <span className="text-lg text-slate-400 font-normal">tCO2e</span></p>
        </Card>
        <Card className="flex flex-col justify-center">
          <h3 className="text-slate-500 font-medium text-sm">Renewable Energy %</h3>
          <p className="text-3xl font-bold text-[#4CAF3A] mt-2">45%</p>
        </Card>
      </div>

      <Card>
        <div className="h-[400px] flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-slate-400 font-medium">Detailed Charts Coming Soon</p>
        </div>
      </Card>
    </div>
  );
};
