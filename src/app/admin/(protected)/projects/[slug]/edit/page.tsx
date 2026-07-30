import { notFound } from "next/navigation";

import { getProjectBySlug } from "@/lib/projects";
import { ProjectForm } from "@/components/admin/project-form";

export default async function EditProjectPage(
  props: PageProps<"/admin/projects/[slug]/edit">,
) {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const { content, ...meta } = project;
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">{meta.title} 수정</h1>
      <ProjectForm mode="edit" initial={{ ...meta, body: content }} />
    </div>
  );
}
