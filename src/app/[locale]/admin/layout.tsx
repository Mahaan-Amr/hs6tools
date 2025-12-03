import { Metadata } from "next";

// Note: Layout metadata is static as layouts don't receive params in the same way as pages
// The actual page metadata will override this for specific pages
export const metadata: Metadata = {
  title: "Admin Panel | HS6Tools",
  description: "Complete system and product management"
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
