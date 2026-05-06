import Link from "next/link";
import { notFound } from "next/navigation";
import CarDetailClient from "@/app/components/CarDetailClient";
import { getCarById } from "@/lib/cars";

type CarPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CarPage({ params }: CarPageProps) {
  const { id } = await params;
  const car = await getCarById(id);

  if (!car) {
    notFound();
  }

  return (
    <main className="car-page-main">
      <div className="car-page-shell">
        <p className="car-back-link">
          <Link href="/#cars">Back to fleet</Link>
        </p>
        <CarDetailClient car={car} />
      </div>
    </main>
  );
}
