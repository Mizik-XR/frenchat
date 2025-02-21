
import { SystemReportChart } from "@/components/monitoring/SystemReportChart";

export const MonitoringDashboard = () => {
  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Tableau de bord de surveillance</h2>
      <SystemReportChart />
    </div>
  );
};
