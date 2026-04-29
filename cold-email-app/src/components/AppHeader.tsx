import { signOut } from "@/auth";
import Link from "next/link";

export default function AppHeader() {
  return (
    <header className="flex items-center justify-between border-b border-black px-3 py-3">
      <Link href="/contacts" className="text-2xl font-bold">
        Cold Email
      </Link>

      <nav className="flex items-center gap-5 text-base">
        <Link href="/contacts" className="hover:underline">
          Contacts
        </Link>

        <Link href="/templates" className="hover:underline">
          Template
        </Link>

        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button className="border border-black px-4 py-2 text-base hover:bg-black hover:text-white">
            Sign Out
          </button>
        </form>
      </nav>
    </header>
  );
}