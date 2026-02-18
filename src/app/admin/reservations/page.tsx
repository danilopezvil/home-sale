import { requireAdminUser } from "@/lib/admin-auth";

export default async function AdminReservationsPage() {
  const user = await requireAdminUser();

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold">Admin Reservations</h1>
      <p className="mt-2 text-slate-600">Signed in as {user.email}.</p>
      <p className="mt-1 text-slate-600">Placeholder page for managing reservations.</p>
    </section>
  );
}
