import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { FileText, ShieldCheck } from 'lucide-react';

export default function Policies() {
  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2"><FileText /> Politici & Documente</h1>
        <div className="space-y-4">
          <div className="p-4 bg-white border rounded-lg shadow-sm flex justify-between items-center">
            <span>Termeni și Condiții</span>
            <span className="text-green-600 font-bold">ACTIV</span>
          </div>
          <div className="p-4 bg-white border rounded-lg shadow-sm flex justify-between items-center">
            <span>Politica de Confidențialitate (GDPR)</span>
            <span className="text-green-600 font-bold">ACTIV</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
