import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { {{PASCAL_SINGULAR}}Form } from "../../_components/{{ENTITY_SINGULAR}}-form";

interface Edit{{PASCAL_SINGULAR}}PageProps {
  params: Promise<{ id: string }>;
}

export default async function Edit{{PASCAL_SINGULAR}}Page({
  params,
}: Edit{{PASCAL_SINGULAR}}PageProps) {
  const { id } = await params;

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit {{TITLE_SINGULAR}}</CardTitle>
          <CardDescription>
            Load entity {id} through the approved server query and mutation boundary.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <{{PASCAL_SINGULAR}}Form />
        </CardContent>
      </Card>
    </div>
  );
}
