import { HomeClient } from "@/app/components/map/home-client";

async function getData(citySlug: string) {
  const base = process.env.NEXT_PUBLIC_API_URL;

  const citiesRes = await fetch(`${base}/cities`, { cache: "no-store" });
  const cities = await citiesRes.json();

  const city = cities.find((c: any) => c.slug === citySlug);

  if (!city) return null;

  const [zonesRes, parkingsRes] = await Promise.all([
    fetch(`${base}/zones?cityId=${city.id}`, { cache: "no-store" }),
    fetch(`${base}/parkings?cityId=${city.id}`, { cache: "no-store" }),
  ]);

  const zones = await zonesRes.json();
  const parkings = await parkingsRes.json();

  return { city, zones, parkings };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ citySlug: string }>;
}) {
  const { citySlug } = await params;
  const data = await getData(citySlug);

  if (!data) {
    return <div>Градът не е намерен</div>;
  }

  return (
    <HomeClient city={data.city} zones={data.zones} parkings={data.parkings} />
  );
}
