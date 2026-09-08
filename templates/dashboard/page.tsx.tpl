import { {{PASCAL_NAME}}Activity } from "./_components/{{ROUTE_NAME}}-activity";
import { {{PASCAL_NAME}}Header } from "./_components/{{ROUTE_NAME}}-header";
import { {{PASCAL_NAME}}Kpis } from "./_components/{{ROUTE_NAME}}-kpis";

export default function {{PASCAL_NAME}}DashboardPage() {
  return (
    <div className="space-y-6">
      <{{PASCAL_NAME}}Header />
      <{{PASCAL_NAME}}Kpis />
      <{{PASCAL_NAME}}Activity />
    </div>
  );
}
