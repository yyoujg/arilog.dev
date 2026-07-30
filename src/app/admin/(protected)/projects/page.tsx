import Link from "next/link";

import { getAllProjects } from "@/lib/projects";
import { buttonVariants } from "@/components/ui/button-variants";
import { DeleteProjectDialog } from "@/components/admin/delete-project-dialog";

export default function AdminProjectsPage() {
  const projects = getAllProjects();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Projects</h1>
        <Link href="/admin/projects/new" className={buttonVariants()}>
          새 프로젝트 작성
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-border border-b text-left">
              <th className="py-2 pr-4">title</th>
              <th className="py-2 pr-4">period</th>
              <th className="py-2 pr-4">order</th>
              <th className="py-2 pr-4">featured</th>
              <th className="py-2 pr-4">draft</th>
              <th className="py-2 pr-4">관리</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.slug} className="border-border border-b">
                <td className="py-2 pr-4">{project.title}</td>
                <td className="py-2 pr-4">{project.period}</td>
                <td className="py-2 pr-4">{project.order}</td>
                <td className="py-2 pr-4">{project.featured ? "Y" : ""}</td>
                <td className="py-2 pr-4">{project.draft ? "Y" : ""}</td>
                <td className="py-2 pr-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/projects/${project.slug}/edit`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      수정
                    </Link>
                    <DeleteProjectDialog
                      slug={project.slug}
                      title={project.title}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
