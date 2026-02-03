import { Layout } from '@/components/layout/Layout';

export default function Index() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">MarketPlace Romania</h1>
        <p className="text-lg text-muted-foreground">Welcome to the marketplace</p>
      </div>
    </Layout>
  );
}
