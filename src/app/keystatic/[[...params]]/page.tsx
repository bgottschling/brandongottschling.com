import { notFound } from "next/navigation";
import Keystatic from "../keystatic";

export default function KeystaticPage() {
  // Local-mode Keystatic writes to the filesystem — dev only.
  if (process.env.NODE_ENV === "production") notFound();
  return <Keystatic />;
}
