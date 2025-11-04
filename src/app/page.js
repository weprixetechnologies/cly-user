import ProductGridInfinity from "@/components/products/productGridInfinity";
import Slider from "@/components/slider";
import CategoriesCom from "@/components/ui/categories-com";
import Headings from "@/components/ui/headings";
import Image from "next/image";
import aboutbanner from '../../public/ibs.jpg'
import ProductGrid from "@/components/products/productGrid";
// import ProductGrid from "@/components/products/productGrid";

// export const revalidate = 60; // ISR: revalidate every 60 seconds

async function fetchSliders() {
  const baseUrl =  'https://api.cursiveletters.in/api';
  const [desktopRes, mobileRes] = await Promise.all([
    fetch(`${baseUrl}/sliders/desktop`, { next: { revalidate: 60 } }),
    fetch(`${baseUrl}/sliders/mobile`, { next: { revalidate: 60 } }),
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
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'https://api.cursiveletters.in/api';
  try {
    const res = await fetch(`${baseUrl}/categories`, { next: { revalidate: 1 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.categories || [];
  } catch (_) {
    return [];
  }
}

export default async function Home() {
  const [sliderData, categories] = await Promise.all([
    fetchSliders(),
    fetchCategories(),
  ]);
  const { desktop, mobile } = sliderData;

  return (
    <div>
      <Slider desktopImages={desktop.map(d => d.imgUrl)} mobileImages={mobile.map(m => m.imgUrl)} />

      <Headings subHeading="Shop by Categories" heading="What You Need" />
      <CategoriesCom categories={categories} />
      {/* <Headings subHeading="Picks Curating With Your Needs" heading="Arrivals That Attract" /> */}
      {/* <div className="h-7"></div> */}
      {/* <div className="md:px-15 px-4">
        <ProductGrid initialLimit={8} maxTotal={8} />
      </div>
      <div className="h-7"></div> */}
      <Image src={aboutbanner} alt="aboutbanner" width={0} height={0} sizes="100vw" style={{ width: '100%', height: 'auto' }} />
      <Headings subHeading="Picks Curating With Your Needs" heading="Arrivals That Attract" />
      <div className="h-7"></div>
      <div className="md:px-15 px-4">
        <ProductGridInfinity initialLimit={8} maxTotal={100} outOfStock={false} />
      </div>
    </div>
  );
}
