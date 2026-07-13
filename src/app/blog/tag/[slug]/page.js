import { redirect } from 'next/navigation';

export default async function ProductTagPage({ params }) {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    redirect(`/blog?tag=${slug}`);
}
