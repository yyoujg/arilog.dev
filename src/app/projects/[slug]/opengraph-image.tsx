import { SITE } from "@/constants/site";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";
import { OG_SIZE, OG_CONTENT_TYPE, renderOg } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = SITE.name;

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export default async function Image(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  return renderOg({
    eyebrow: "Project",
    title: project?.title ?? SITE.name,
  });
}
