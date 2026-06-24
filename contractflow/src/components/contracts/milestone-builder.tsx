'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, formatCurrency } from '@/lib/utils';
import { Plus, Trash2, ChevronUp, ChevronDown, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface Milestone {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  description: string;
}

interface MilestoneBuilderProps {
  milestones: Milestone[];
  onChange: (milestones: Milestone[]) => void;
  contractValue: number;
  currency?: string;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function MilestoneBuilder({
  milestones,
  onChange,
  contractValue,
  currency = 'GBP',
}: MilestoneBuilderProps) {
  const total = milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
  const diff = contractValue - total;
  const isBalanced = Math.abs(diff) < 0.01;
  const hasValue = contractValue > 0;

  function addMilestone() {
    const newMilestone: Milestone = {
      id: generateId(),
      title: '',
      amount: 0,
      dueDate: '',
      description: '',
    };
    onChange([...milestones, newMilestone]);
  }

  function removeMilestone(id: string) {
    onChange(milestones.filter((m) => m.id !== id));
  }

  function updateMilestone(id: string, field: keyof Milestone, value: string | number) {
    onChange(
      milestones.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      )
    );
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const updated = [...milestones];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(updated);
  }

  function moveDown(index: number) {
    if (index === milestones.length - 1) return;
    const updated = [...milestones];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onChange(updated);
  }

  function addDefaultStructure() {
    const depositAmount = contractValue * 0.5;
    const finalAmount = contractValue * 0.5;
    onChange([
      {
        id: generateId(),
        title: 'Deposit',
        amount: depositAmount,
        dueDate: '',
        description: '50% deposit due upon contract signing.',
      },
      {
        id: generateId(),
        title: 'Final Payment',
        amount: finalAmount,
        dueDate: '',
        description: 'Remaining 50% due upon project completion.',
      },
    ]);
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      {hasValue && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-md px-4 py-2.5 text-sm',
            isBalanced
              ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300'
              : 'bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300'
          )}
        >
          {isBalanced ? (
            <CheckCircle2 size={16} className="shrink-0" />
          ) : (
            <AlertTriangle size={16} className="shrink-0" />
          )}
          <span className="flex-1">
            {isBalanced ? (
              <>Milestones total matches contract value ({formatCurrency(total, currency)})</>
            ) : diff > 0 ? (
              <>
                Milestone total is{' '}
                <strong>{formatCurrency(Math.abs(diff), currency)}</strong> under contract value (
                {formatCurrency(contractValue, currency)})
              </>
            ) : (
              <>
                Milestone total is{' '}
                <strong>{formatCurrency(Math.abs(diff), currency)}</strong> over contract value (
                {formatCurrency(contractValue, currency)})
              </>
            )}
          </span>
          <span className="font-medium tabular-nums">
            {formatCurrency(total, currency)} / {formatCurrency(contractValue, currency)}
          </span>
        </div>
      )}

      {/* Milestone list */}
      <div className="space-y-3">
        {milestones.length === 0 && (
          <div className="text-center py-8 border border-dashed border-border rounded-lg text-muted-foreground text-sm">
            <p>No milestones added yet.</p>
            {contractValue > 0 && (
              <button
                type="button"
                onClick={addDefaultStructure}
                className="mt-2 text-primary hover:underline text-sm"
              >
                Add deposit + final payment structure
              </button>
            )}
          </div>
        )}

        {milestones.map((milestone, index) => (
          <div
            key={milestone.id}
            className="border border-border rounded-lg p-4 bg-card space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-muted-foreground">Milestone {index + 1}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="p-1 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(index)}
                  disabled={index === milestones.length - 1}
                  className="p-1 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => removeMilestone(milestone.id)}
                  className="p-1 rounded hover:bg-destructive/10 text-destructive"
                  title="Remove milestone"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor={`milestone-title-${milestone.id}`} className="text-xs">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`milestone-title-${milestone.id}`}
                  value={milestone.title}
                  onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                  placeholder="e.g. Deposit, Phase 1, Final Payment"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`milestone-amount-${milestone.id}`} className="text-xs">
                  Amount ({currency}) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`milestone-amount-${milestone.id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={milestone.amount || ''}
                  onChange={(e) => updateMilestone(milestone.id, 'amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`milestone-due-${milestone.id}`} className="text-xs">
                  Due Date
                </Label>
                <Input
                  id={`milestone-due-${milestone.id}`}
                  type="date"
                  value={milestone.dueDate}
                  onChange={(e) => updateMilestone(milestone.id, 'dueDate', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`milestone-desc-${milestone.id}`} className="text-xs">
                  Description
                </Label>
                <Input
                  id={`milestone-desc-${milestone.id}`}
                  value={milestone.description}
                  onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                  placeholder="Optional description"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={addMilestone} className="gap-2">
        <Plus size={15} />
        Add Milestone
      </Button>
    </div>
  );
}
