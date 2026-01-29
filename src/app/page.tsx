export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-gray-900">
      <main className="flex w-full max-w-4xl flex-col items-center justify-center gap-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-blue-600">
          Vercel Test UI
        </h1>
        <p className="text-lg leading-8 text-gray-600">
          This is a blank project ready for testing and sharing with your team.
        </p>
        <div className="mt-6 flex gap-4">
          <a
            href="https://vercel.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 hover:text-white"
          >
            Vercel Documentation
          </a>
          <a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md ring-1 ring-inset ring-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-900 bg-white hover:bg-gray-50"
          >
            Next.js Docs
          </a>
        </div>
      </main>
    </div>
  );
}
