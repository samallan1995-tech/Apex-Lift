import { ALLERGENS } from '@/lib/allergens';

export const metadata = {
  title: 'Free 14-allergen matrix template (printable) — AllerSafe',
  description:
    'A free, printable UK 14-allergen matrix template for food businesses. Print it, list your dishes, and tick the allergens each one contains.',
  robots: { index: false },
};

const BLANK_ROWS = 18;

export default function MatrixTemplatePage() {
  return (
    <div className="bg-white min-h-screen text-gray-900 print:bg-white">
      <div className="print:hidden bg-[#0E2A06] text-white px-4 py-3">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm">Your free allergen matrix template — use your browser&apos;s print dialog to print or save as PDF.</p>
          <span className="text-xs text-[#C0DD97]">Tip: print landscape, A4</span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-6 print:p-0">
        <header className="mb-4">
          <h1 className="text-2xl font-extrabold">Allergen matrix</h1>
          <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
            <p>Business name: ________________________________</p>
            <p>Completed by: ________________________________</p>
            <p>Date completed: ______________________________</p>
            <p>Review due: __________________________________</p>
          </div>
        </header>

        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          List each dish, then tick every allergen it contains. Check each ingredient against your
          supplier specification sheets — never from memory. Re-check whenever a recipe, supplier or
          ingredient batch changes. This template is an aid only: your business remains legally
          responsible for the accuracy of its allergen information.
        </p>

        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr>
              <th className="border border-gray-400 bg-gray-100 p-1.5 text-left w-44">Dish</th>
              {ALLERGENS.map(a => (
                <th key={a.key} className="border border-gray-400 bg-gray-100 p-1 text-center align-bottom">
                  <span className="block leading-tight">{a.short}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: BLANK_ROWS }).map((_, i) => (
              <tr key={i}>
                <td className="border border-gray-300 h-8" />
                {ALLERGENS.map(a => (
                  <td key={a.key} className="border border-gray-300" />
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3 text-[9px] text-gray-500 leading-relaxed">
          <p className="font-semibold text-gray-600">Key — the 14 UK regulated allergens:</p>
          <p>{ALLERGENS.map(a => `${a.short} = ${a.label}`).join('  ·  ')}</p>
          <p className="mt-2">
            Template by AllerSafe (allersafe.org) — build labels, matrices and QR allergen menus from
            one ingredient list. Free 14-day trial, no card required.
          </p>
        </div>
      </main>
    </div>
  );
}
