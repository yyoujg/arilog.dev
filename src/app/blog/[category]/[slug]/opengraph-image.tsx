import { SITE } from "@/constants/site";
import { getAllPosts, getPostBySlug } from "@/lib/mdx";
import { OG_SIZE, OG_CONTENT_TYPE, renderOg } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = SITE.name;

export function generateStaticParams() {
  return getAllPosts().map((post) => {
    const [category, slug] = post.slug.split("/");
    return { category, slug };
  });
}

export default async function Image(props: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await props.params;
  const post = getPostBySlug(`${category}/${slug}`);
  return renderOg({
    eyebrow: post?.category,
    title: post?.title ?? SITE.name,
  });
}
