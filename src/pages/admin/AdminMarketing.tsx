import { AdminLayout } from "@/components/admin/AdminLayout";
import { AIMarketingDashboard } from "@/components/admin/AIMarketingDashboard";

const AdminMarketing = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI Marketing Manager</h1>
          <p className="text-muted-foreground">
            Generează și trimite campanii de marketing automat cu ajutorul AI-ului
          </p>
        </div>
        <AIMarketingDashboard />
      </div>
    </AdminLayout>
  );
};

export default AdminMarketing;
