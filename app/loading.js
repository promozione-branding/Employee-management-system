// app/loading.js



 


export default function Loading() {
  return (
    <main className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-slate-950 px-5 py-10 text-white">
      {/* Background Effects */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl sm:h-96 sm:w-96" />

      <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl sm:h-96 sm:w-96" />

      {/* Loading Content */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        {/* Animated Spinner */}
        <div className="relative mb-8 flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-blue-400 border-r-violet-400" />

          <div className="absolute inset-3 animate-[spin_2s_linear_infinite_reverse] rounded-full border-2 border-transparent border-b-blue-300 border-l-violet-400" />

          <div className="h-8 w-8 animate-pulse rounded-xl bg-gradient-to-br from-blue-400 to-violet-500 shadow-lg shadow-blue-500/30 sm:h-10 sm:w-10" />
        </div>

        {/* Text */}
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Getting things ready
        </h1>

        <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400 sm:text-base">
          Please wait a moment while we prepare everything for you.
        </p>

        {/* Animated Progress Bar */}
        <div className="mt-8 h-1.5 w-48 max-w-full overflow-hidden rounded-full bg-white/10 sm:w-56">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-violet-400" />
        </div>

        <p className="mt-4 text-xs font-medium tracking-[0.2em] text-slate-500">
          LOADING...
        </p>
      </div>
    </main>
  );
}


