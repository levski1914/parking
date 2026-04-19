import { HomeClient } from "@/app/components/map/home-client";
import { getCities, getParkings, getZones } from "@/app/lib/api";

export default async function HomePage() {
  const cities = await getCities();
  const varna = cities.find((city: { slug: string }) => city.slug === "varna");

  const zones = varna ? await getZones(varna.id) : [];
  const parkings = varna ? await getParkings(varna.id) : [];

  return <HomeClient zones={zones} parkings={parkings} />;
}
