import BlogDetailPage from '../../../src/components/BlogDetailPage.js';

export default async function Page({ params }) {
  const { slug } = await params;
  return <BlogDetailPage slug={slug} />;
}
