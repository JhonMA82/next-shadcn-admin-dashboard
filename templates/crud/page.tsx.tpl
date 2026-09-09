import Link from "next/link";

import { Button } from "@/components/ui/button";

import { {{PASCAL_SINGULAR}}Table } from "./_components/{{ENTITY_SINGULAR}}-table";
import { {{CAMEL_PLURAL}} } from "./_data/{{ENTITY_PLURAL}}";

export default function {{PASCAL_PLURAL}}Page() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-semibold text-2xl tracking-tight">{{TITLE_PLURAL}}</h1>
          <p className="text-muted-foreground">{{DESCRIPTION}}</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/{{ROUTE_NAME}}/new">Create {{TITLE_SINGULAR}}</Link>
        </Button>
      </header>

      <{{PASCAL_SINGULAR}}Table data={{{CAMEL_PLURAL}}} />
    </div>
  );
}
