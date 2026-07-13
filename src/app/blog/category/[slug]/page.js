import { redirect } from 'next/navigation';

export default async function ProductCategoryPage({ params }) {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    redirect(`/blog?category=${slug}`);
}
