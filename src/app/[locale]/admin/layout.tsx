import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin-auth";

// Note: Layout metadata is static as layouts don't receive params in the same way as pages
// The actual page metadata will override this for specific pages
export const metadata: Metadata = {
  title: "Admin Panel | HS6Tools",
  description: "Complete system and product management"
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, session] = await Promise.all([
    params,
    getServerSession(authOptions),
  ]);

  if (!session?.user) redirect(`/${locale}/auth/login`);
  if (!isAdmin(session.user.role)) redirect(`/${locale}`);

  return children;
}
