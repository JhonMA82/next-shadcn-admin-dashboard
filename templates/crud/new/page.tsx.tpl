import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { {{PASCAL_SINGULAR}}Form } from "../_components/{{ENTITY_SINGULAR}}-form";

export default function New{{PASCAL_SINGULAR}}Page() {
  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create {{TITLE_SINGULAR}}</CardTitle>
          <CardDescription>
            Connect this form to an approved server mutation before production use.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <{{PASCAL_SINGULAR}}Form />
        </CardContent>
      </Card>
    </div>
  );
}
