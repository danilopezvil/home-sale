import { AdminSidebar } from "@/components/admin-sidebar";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid gap-5 xl:grid-cols-[256px_minmax(0,1fr)]">
      <AdminSidebar />
      <div>{children}</div>
    </div>
  );
}
