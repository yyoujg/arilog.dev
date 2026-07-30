import { getAllProjects } from "@/lib/projects";
import { ProjectForm } from "@/components/admin/project-form";

export default function NewProjectPage() {
  const orders = getAllProjects().map((p) => p.order);
  const suggestedOrder = orders.length ? Math.max(...orders) + 1 : 1;

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">새 프로젝트 작성</h1>
      <ProjectForm mode="create" suggestedOrder={suggestedOrder} />
    </div>
  );
}
