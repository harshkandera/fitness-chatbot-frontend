import ChatUI from "@/components/ChatUI";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black flex flex-col">
      <header className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white tracking-tight">
            Fitness Coach
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">AI-powered personal trainer</p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://t.me/fitnes_coach_ai_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white border border-neutral-700 hover:border-white px-3 py-1.5 rounded-full transition-colors duration-150"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            Open in Telegram
          </a>

        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-2xl w-full mx-auto px-4 py-6">
        <ChatUI />
      </div>
    </main>
  );
}
