import { Metadata } from "next";

export const metadata: Metadata = {
  title: "پنل مدیریت | HS6Tools",
  description: "مدیریت کامل سیستم و محصولات HS6Tools",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
