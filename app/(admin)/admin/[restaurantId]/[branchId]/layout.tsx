import Sidebar from "@/components/admin/Sidebar";

export default function BranchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-5 sm:px-8 py-6 max-w-6xl">{children}</main>
    </div>
  );
}
