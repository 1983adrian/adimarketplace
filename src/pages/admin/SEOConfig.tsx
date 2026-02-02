import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Share2, BarChart } from 'lucide-react';

export default function SEOConfig() {
  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Search /> SEO & Social Profiles</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-blue-600">Google Business</CardTitle></CardHeader>
            <CardContent><Input placeholder="ID Locație Google" /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-pink-600">Instagram / Facebook</CardTitle></CardHeader>
            <CardContent><Input placeholder="@marketplaceromania" /></CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
