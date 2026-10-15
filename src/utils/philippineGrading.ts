/**
 * Philippine College Grading System Utilities
 * Scale: 1.00 (Highest / Excellent) to 5.00 (Lowest / Failed)
 * Passing Mark: 3.00 (75%)
 * Terms: Prelim, Midterms, Semifinal, Finals
 */

export interface PhGradeInfo {
  numericGrade: number;
  label: string; // e.g. "1.00", "1.25", "5.00"
  description: string;
  status: 'Passed' | 'Conditional' | 'Failed';
  colorBadge: string;
  standing: 'President’s List' | 'Dean’s List' | 'Good Standing' | 'Academic Warning' | 'Critical / Academic Probation';
}

export const PH_GRADING_SCALE_REFERENCE = [
  { grade: '1.00', percentage: '97 - 100%', description: 'Excellent / Highest Honors (A+)', status: 'Passed' },
  { grade: '1.25', percentage: '94 - 96%', description: 'Superior / High Honors (A)', status: 'Passed' },
  { grade: '1.50', percentage: '91 - 93%', description: 'Very Good / Honors (A-)', status: 'Passed' },
  { grade: '1.75', percentage: '88 - 90%', description: 'Good (B+)', status: 'Passed' },
  { grade: '2.00', percentage: '85 - 87%', description: 'Satisfactory (B)', status: 'Passed' },
  { grade: '2.25', percentage: '82 - 84%', description: 'Fairly Satisfactory (B-)', status: 'Passed' },
  { grade: '2.50', percentage: '79 - 81%', description: 'Fair (C+)', status: 'Passed' },
  { grade: '2.75', percentage: '76 - 78%', description: 'Passing (C)', status: 'Passed' },
  { grade: '3.00', percentage: '75%', description: 'Barely Passing Mark (Passing threshold)', status: 'Passed' },
  { grade: '4.00', percentage: '70 - 74%', description: 'Conditional / Remedial Examination', status: 'Conditional' },
  { grade: '5.00', percentage: 'Below 70%', description: 'Failed / Dropped (Lowest Grade)', status: 'Failed' },
];

export function percentageToPhGrade(percentage: number): PhGradeInfo {
  const p = Math.max(0, Math.min(100, Math.round(percentage * 10) / 10));

  if (p >= 97) {
    return {
      numericGrade: 1.0,
      label: '1.00',
      description: 'Excellent / Highest Honors',
      status: 'Passed',
      colorBadge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      standing: 'President’s List',
    };
  }
  if (p >= 94) {
    return {
      numericGrade: 1.25,
      label: '1.25',
      description: 'Superior / High Honors',
      status: 'Passed',
      colorBadge: 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
      standing: 'Dean’s List',
    };
  }
  if (p >= 91) {
    return {
      numericGrade: 1.5,
      label: '1.50',
      description: 'Very Good / Honors',
      status: 'Passed',
      colorBadge: 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
      standing: 'Dean’s List',
    };
  }
  if (p >= 88) {
    return {
      numericGrade: 1.75,
      label: '1.75',
      description: 'Good',
      status: 'Passed',
      colorBadge: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      standing: 'Good Standing',
    };
  }
  if (p >= 85) {
    return {
      numericGrade: 2.0,
      label: '2.00',
      description: 'Satisfactory',
      status: 'Passed',
      colorBadge: 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700',
      standing: 'Good Standing',
    };
  }
  if (p >= 82) {
    return {
      numericGrade: 2.25,
      label: '2.25',
      description: 'Fairly Satisfactory',
      status: 'Passed',
      colorBadge: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      standing: 'Good Standing',
    };
  }
  if (p >= 79) {
    return {
      numericGrade: 2.5,
      label: '2.50',
      description: 'Fair',
      status: 'Passed',
      colorBadge: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700',
      standing: 'Good Standing',
    };
  }
  if (p >= 76) {
    return {
      numericGrade: 2.75,
      label: '2.75',
      description: 'Passing',
      status: 'Passed',
      colorBadge: 'bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700',
      standing: 'Academic Warning',
    };
  }
  if (p >= 75) {
    return {
      numericGrade: 3.0,
      label: '3.00',
      description: 'Barely Passing (Threshold)',
      status: 'Passed',
      colorBadge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700',
      standing: 'Academic Warning',
    };
  }
  if (p >= 70) {
    return {
      numericGrade: 4.0,
      label: '4.00',
      description: 'Conditional / Remedial',
      status: 'Conditional',
      colorBadge: 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800',
      standing: 'Critical / Academic Probation',
    };
  }
  return {
    numericGrade: 5.0,
    label: '5.00',
    description: 'Failed (Lowest Grade)',
    status: 'Failed',
    colorBadge: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800',
    standing: 'Critical / Academic Probation',
  };
}

export function formatPhGwa(gwa: number): { label: string; standing: string; badge: string } {
  const g = Math.round(gwa * 100) / 100;
  if (g <= 1.25) {
    return {
      label: g.toFixed(2),
      standing: 'President’s Lister / Highest Honors',
      badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300',
    };
  }
  if (g <= 1.5) {
    return {
      label: g.toFixed(2),
      standing: 'Dean’s Lister / High Honors',
      badge: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300',
    };
  }
  if (g <= 1.75) {
    return {
      label: g.toFixed(2),
      standing: 'Dean’s Lister',
      badge: 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200',
    };
  }
  if (g <= 2.5) {
    return {
      label: g.toFixed(2),
      standing: 'Good Academic Standing',
      badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300',
    };
  }
  if (g <= 3.0) {
    return {
      label: g.toFixed(2),
      standing: 'Watchlist / Academic Warning',
      badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300',
    };
  }
  return {
    label: g.toFixed(2),
    standing: 'Critical / Academic Probation (Failed)',
    badge: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300',
  };
}

export const ASSESSMENT_TERMS = [
  { term: 'Prelim' as const, label: 'Prelim Examination', weight: 20, defaultMax: 100 },
  { term: 'Midterms' as const, label: 'Midterms Examination', weight: 25, defaultMax: 100 },
  { term: 'Semifinal' as const, label: 'Semifinal Examination', weight: 25, defaultMax: 100 },
  { term: 'Finals' as const, label: 'Finals Examination', weight: 30, defaultMax: 100 },
];
