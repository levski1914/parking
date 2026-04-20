import Link from "next/link";
import { Navbar } from "@/app/components/layout/navbar";

async function getCities() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cities`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch cities");
  }

  return res.json();
}

const popularSlugs = ["varna", "sofia", "plovdiv", "burgas"];

export default async function HomePage() {
  const cities = await getCities();

  const popularCities = cities.filter((city: any) =>
    popularSlugs.includes(city.slug),
  );

  const otherCities = cities.filter(
    (city: any) => !popularSlugs.includes(city.slug),
  );

  return (
    <>
      <Navbar />

      <main style={{ minHeight: "100vh", background: "#f1f5f9" }}>
        <section
          style={{
            maxWidth: 1440,
            margin: "0 auto",
            padding: "48px 24px 24px",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #ffffff, #eff6ff)",
              border: "1px solid #dbeafe",
              borderRadius: 24,
              padding: 32,
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: 48,
                lineHeight: 1.1,
                color: "#0f172a",
              }}
            >
              Намери къде да паркираш в България
            </h1>

            <p
              style={{
                marginTop: 16,
                maxWidth: 760,
                fontSize: 18,
                lineHeight: 1.6,
                color: "#475569",
              }}
            >
              ParkBG събира на едно място зони, общински и частни паркинги, за
              да виждаш къде можеш да спреш, колко струва и как да платиш.
            </p>

            <div
              style={{
                marginTop: 24,
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <Link
                href={popularCities[0] ? `/${popularCities[0].slug}` : "/"}
                style={{
                  textDecoration: "none",
                  padding: "12px 18px",
                  borderRadius: 12,
                  background: "#2563eb",
                  color: "#fff",
                  fontWeight: 600,
                }}
              >
                Отвори карта
              </Link>

              <a
                href="#popular-cities"
                style={{
                  textDecoration: "none",
                  padding: "12px 18px",
                  borderRadius: 12,
                  background: "#fff",
                  color: "#0f172a",
                  border: "1px solid #cbd5e1",
                  fontWeight: 600,
                }}
              >
                Популярни градове
              </a>
            </div>
          </div>
        </section>

        <section
          id="popular-cities"
          style={{
            maxWidth: 1440,
            margin: "0 auto",
            padding: "0 24px 24px",
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 28, color: "#0f172a" }}>
              Популярни градове
            </h2>
            <p style={{ marginTop: 8, color: "#64748b" }}>
              Започни с най-търсените градове
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            {popularCities.map((city: any) => (
              <Link
                key={city.id}
                href={`/${city.slug}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 18,
                    padding: 20,
                    minHeight: 140,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: "#dbeafe",
                      marginBottom: 16,
                    }}
                  />

                  <h3
                    style={{
                      margin: 0,
                      fontSize: 22,
                      color: "#0f172a",
                    }}
                  >
                    {city.name}
                  </h3>

                  <p style={{ marginTop: 8, color: "#64748b" }}>
                    Виж зони и паркинги
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section
          style={{
            maxWidth: 1440,
            margin: "0 auto",
            padding: "0 24px 40px",
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 28, color: "#0f172a" }}>
              Всички градове
            </h2>
            <p style={{ marginTop: 8, color: "#64748b" }}>
              Избери град и отвори картата
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
            }}
          >
            {[...popularCities, ...otherCities].map((city: any) => (
              <Link
                key={city.id}
                href={`/${city.slug}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 14,
                    padding: 16,
                    color: "#0f172a",
                    fontWeight: 600,
                  }}
                >
                  {city.name}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
