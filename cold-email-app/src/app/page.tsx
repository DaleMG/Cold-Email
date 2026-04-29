import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/contacts");
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="flex items-center justify-between border-b border-black px-3 py-3">
        <h1 className="text-2xl font-bold">Cold Email</h1>

        <form
          action={async () => {
            "use server";
            await signIn("google");
          }}
        >
          <button className="border border-black px-4 py-2 hover:bg-black hover:text-white">
            Sign In
          </button>
        </form>
      </header>

      <section className="mx-auto max-w-[1150px] px-6 py-20 text-center">
        <h2 className="mb-4 text-5xl font-bold">Send Better Cold Emails</h2>

        <p className="mx-auto mb-10 max-w-2xl text-lg">
          Manage contacts, write one reusable template, and send personalised
          emails from your own Gmail account.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("google");
          }}
        >
          <button className="border border-black px-8 py-3 text-lg hover:bg-black hover:text-white">
            Sign In With Google
          </button>
        </form>

        <div className="mt-16 grid grid-cols-3 gap-6 text-left">
          <div className="border border-black p-6">
            <h3 className="mb-3 text-xl font-bold">Manage Contacts</h3>
            <p>Save recipient details and track who has been emailed.</p>
          </div>

          <div className="border border-black p-6">
            <h3 className="mb-3 text-xl font-bold">Reusable Template</h3>
            <p>Write one email template and personalise it with placeholders.</p>
          </div>

          <div className="border border-black p-6">
            <h3 className="mb-3 text-xl font-bold">Send From Gmail</h3>
            <p>Emails are sent directly from the signed-in Gmail account.</p>
          </div>
        </div>
      </section>
    </main>
  );
}