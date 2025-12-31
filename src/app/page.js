import Slider from "@/components/slider";
import CategoriesCom from "@/components/ui/categories-com";
import Headings from "@/components/ui/headings";
import Image from "next/image";
import aboutbanner from '../../public/ibs.jpg'
import ProductGridHome from "@/components/products/productGridHome";
import VisitorTracker from "@/components/visitor-tracker";
import FeaturedProducts from "@/components/products/FeaturedProducts";


export const revalidate = 60; // ISR: revalidate every 60 seconds

async function fetchSliders() {
  const baseUrl = 'http://localhost:9878/api';
  const [desktopRes, mobileRes] = await Promise.all([
    fetch(`${baseUrl}/sliders/desktop`, { cache: 'no-store' }),
    fetch(`${baseUrl}/sliders/mobile`, { cache: 'no-store' }),
  ]);

  if (!desktopRes.ok || !mobileRes.ok) {
    return { desktop: [], mobile: [] };
  }

  const desktopJson = await desktopRes.json();
  const mobileJson = await mobileRes.json();
  console.log(desktopJson, mobileJson);

  return {
    desktop: desktopJson?.data || [],
    mobile: mobileJson?.data || [],
  };
}

async function fetchCategories() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:9878/api';
  try {
    const res = await fetch(`${baseUrl}/categories`, { next: { revalidate: 1 } });
    if (!res.ok) return [];
    const json = await res.json();
    console.log(json.categories);

    return json?.categories || [];
  } catch (_) {
    return [];
  }
}

async function fetchProducts(limit = 50, maxTotal = 100, outOfStock = false) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:9878/api';
  try {
    const url = new URL(`${baseUrl}/products/list`);
    url.searchParams.set('page', '1');
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('status', 'active');
    url.searchParams.set('outOfStock', String(outOfStock));

    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    const products = json?.data?.products || [];

    // Limit to maxTotal if specified
    return typeof maxTotal === 'number' ? products.slice(0, maxTotal) : products;
  } catch (_) {
    return [];
  }
}

async function fetchFeaturedProducts(limit = 20) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:9878/api';
  try {
    const url = new URL(`${baseUrl}/products/featured`);
    url.searchParams.set('limit', String(limit));
    // console.log('fetching featured products', url.toString());

    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch (_) {
    return [];
  }
}

export default async function Home() {
  const [sliderData, categories, products, featuredProducts] = await Promise.all([
    fetchSliders(),
    fetchCategories(),
    fetchProducts(50, 100, false),
    fetchFeaturedProducts(20),
  ]);
  const { desktop, mobile } = sliderData;

  return (
    <div>
      <VisitorTracker />
      <Slider desktopImages={desktop.map(d => d.imgUrl)} mobileImages={mobile.map(m => m.imgUrl)} />

      <Headings subHeading="Shop by Categories" heading="What You Need" />
      <CategoriesCom categories={categories} />

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <>
          <div className="h-7"></div>
          <Headings subHeading="Handpicked for You" heading="Featured Products" />
          <div className="md:px-15 px-4">
            <FeaturedProducts products={featuredProducts} />
          </div>
        </>
      )}

      {/* <Headings subHeading="Picks Curating With Your Needs" heading="Arrivals That Attract" /> */}
      {/* <div className="h-7"></div> */}
      {/* <div className="md:px-15 px-4">
        <ProductGrid initialLimit={8} maxTotal={8} />
      </div>
      <div className="h-7"></div> */}
      <Headings subHeading="Picks Curating With Your Needs" heading="Arrivals That Attract" />
      <div className="h-7"></div>
      <div className="md:px-15 px-4">
        <ProductGridHome products={products} visitShop={true} />
      </div>
      <Image src={aboutbanner} alt="aboutbanner" width={0} height={0} sizes="100vw" style={{ width: '100%', height: 'auto' }} />
    </div>
  );
}
