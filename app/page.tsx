import { CompactOutfitRouletteWithBudgetComponent } from "@/components/compact-outfit-roulette-with-budget"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-6 sm:py-8 min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Dripcheck by Dripstreet</h1>
        <CompactOutfitRouletteWithBudgetComponent />
      </div>
    </main>
  )
}
