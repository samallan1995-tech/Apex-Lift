'use client';
import Link from 'next/link';

interface Props {
  hasVenue: boolean;
  ingredientCount: number;
  dishCount: number;
}

interface Step {
  n: number;
  title: string;
  desc: string;
  href?: string;
  cta: string;
  done: boolean;
  external?: boolean;
}

/**
 * First-run tutorial. Walks a new restaurant through the four steps to a
 * compliant allergen menu, ticking each off as they complete it. Hides itself
 * automatically once the venue has ingredients and dishes.
 */
export function OnboardingChecklist({ hasVenue, ingredientCount, dishCount }: Props) {
  const steps: Step[] = [
    {
      n: 1,
      title: 'Create your venue',
      desc: 'Add your restaurant or café. You can add more sites later.',
      cta: hasVenue ? 'Done' : 'Use the venue switcher (top-left)',
      done: hasVenue,
    },
    {
      n: 2,
      title: 'Add your ingredients',
      desc: 'List each ingredient and tick which of the 14 allergens it contains. This is the foundation everything else is built on.',
      href: '/dashboard/ingredients',
      cta: ingredientCount > 0 ? `${ingredientCount} added` : 'Add ingredients',
      done: ingredientCount > 0,
    },
    {
      n: 3,
      title: 'Build your dishes',
      desc: 'Create each menu item from its ingredients — AllerSafe works out the allergens automatically.',
      href: '/dashboard/dishes',
      cta: dishCount > 0 ? `${dishCount} created` : 'Add dishes',
      done: dishCount > 0,
    },
    {
      n: 4,
      title: 'Print labels & share your menu',
      desc: 'Download Natasha’s Law PPDS labels, the allergen matrix, or share a public QR menu — all kept in sync automatically.',
      href: dishCount > 0 ? '/dashboard/labels' : undefined,
      cta: 'Open labels',
      done: false,
    },
  ];

  const completed = steps.filter(s => s.done).length;
  const pct = Math.round((completed / steps.length) * 100);

  return (
    <div className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Welcome to AllerSafe 👋</h2>
          <p className="mt-1 text-sm text-gray-500">
            Four quick steps to a fully compliant allergen menu. Takes about 10 minutes.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          {completed}/{steps.length} done
        </span>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-green-600 transition-all" style={{ width: `${pct}%` }} />
      </div>

      <ol className="mt-5 space-y-3">
        {steps.map(step => (
          <li
            key={step.n}
            className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3"
          >
            <span
              className={
                'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ' +
                (step.done ? 'bg-green-600 text-white' : 'bg-white text-gray-500 ring-1 ring-gray-300')
              }
            >
              {step.done ? '✓' : step.n}
            </span>
            <div className="min-w-0 flex-1">
              <p className={'text-sm font-semibold ' + (step.done ? 'text-gray-400 line-through' : 'text-gray-900')}>
                {step.title}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">{step.desc}</p>
            </div>
            <div className="shrink-0 self-center">
              {step.done ? (
                <span className="text-xs font-medium text-green-600">{step.cta}</span>
              ) : step.href ? (
                <Link
                  href={step.href}
                  target={step.external ? '_blank' : undefined}
                  className="rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-800"
                >
                  {step.cta}
                </Link>
              ) : (
                <span className="text-xs text-gray-400">{step.cta}</span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
