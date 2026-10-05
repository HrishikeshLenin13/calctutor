export interface CourseCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  badge: string;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  slug: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedMinutes: number;
  description: string;
  presetProblem: string;
  keySkills: string[];
}

export const COURSE_CATEGORIES: CourseCategory[] = [
  {
    id: "beginner",
    title: "TI-84 Fundamentals",
    description: "Master the key layout, 2nd & Alpha functions, home screen calculations, and degree/radian modes.",
    icon: "⚡",
    badge: "Essential",
    lessons: [
      {
        id: "beg-1",
        slug: "degree-mode-trig",
        title: "Degree vs Radian Mode & Trig",
        difficulty: "Beginner",
        estimatedMinutes: 5,
        description: "Learn how to switch mode settings and compute correct trigonometric ratios.",
        presetProblem: "sin(30°)",
        keySkills: ["MODE key", "Degree selection", "Trig functions", "Home screen"],
      },
      {
        id: "beg-2",
        slug: "entering-expressions",
        title: "Order of Operations & Ans",
        difficulty: "Beginner",
        estimatedMinutes: 4,
        description: "Master multi-step calculations, parentheses, and reusing the Ans memory register.",
        presetProblem: "2 + 3 * (4 - 1)",
        keySkills: ["Parentheses", "Order of Ops", "Ans key", "Clear"],
      },
    ],
  },
  {
    id: "graphing",
    title: "Graphing & Function Analysis",
    description: "Enter equations, adjust zoom windows, trace curves, and find critical points automatically.",
    icon: "📈",
    badge: "Most Popular",
    lessons: [
      {
        id: "grp-1",
        slug: "find-zeros",
        title: "Finding Function Zeros & X-Intercepts",
        difficulty: "Beginner",
        estimatedMinutes: 6,
        description: "Use CALC option 2 to find exact x-intercepts with left bound, right bound, and guess.",
        presetProblem: "zero of x^2 - 5x + 6",
        keySkills: ["Y= editor", "ZStandard", "CALC menu", "Bounds & Guess"],
      },
      {
        id: "grp-2",
        slug: "min-max-extrema",
        title: "Finding Extrema (Minima & Maxima)",
        difficulty: "Intermediate",
        estimatedMinutes: 7,
        description: "Locate local minimums and maximums for quadratic and polynomial curves.",
        presetProblem: "maximum of -x^2 + 4x + 3",
        keySkills: ["CALC 3:minimum", "CALC 4:maximum", "Window bounds"],
      },
      {
        id: "grp-3",
        slug: "find-intersections",
        title: "Curve Intersections",
        difficulty: "Intermediate",
        estimatedMinutes: 8,
        description: "Graph two simultaneous equations and find their exact points of intersection.",
        presetProblem: "intersection of 2x + 1 and x^2 - 2",
        keySkills: ["Y1 & Y2", "CALC 5:intersect", "First/Second curve"],
      },
      {
        id: "grp-4",
        slug: "table-of-values",
        title: "Table Setup & Value Inspection",
        difficulty: "Beginner",
        estimatedMinutes: 5,
        description: "Generate and inspect numeric value tables for graphed equations.",
        presetProblem: "table of x^2 - 4",
        keySkills: ["2nd GRAPH (Table)", "TBLSET", "Table navigation"],
      },
    ],
  },
  {
    id: "statistics",
    title: "Statistics & Regression",
    description: "Enter data lists, compute 1-Var summary statistics, and calculate linear regressions.",
    icon: "📊",
    badge: "AP Prep",
    lessons: [
      {
        id: "stat-1",
        slug: "one-var-stats",
        title: "1-Variable Summary Statistics",
        difficulty: "Beginner",
        estimatedMinutes: 6,
        description: "Enter single-column data in L1 to compute mean (x̄), Sx, and 5-number summaries.",
        presetProblem: "1-Var Stats of 12, 15, 18, 22, 25, 30",
        keySkills: ["STAT Edit", "List L1", "STAT CALC", "1-Var Stats"],
      },
      {
        id: "stat-2",
        slug: "linear-regression",
        title: "Linear Regression (LinReg ax+b)",
        difficulty: "Intermediate",
        estimatedMinutes: 9,
        description: "Input paired (X, Y) data points in L1 & L2 and fit a linear trendline with slope and intercept.",
        presetProblem: "LinReg for (1,2) (2,5) (3,7) (4,11)",
        keySkills: ["L1 & L2 entry", "STAT CALC 4", "LinReg(ax+b)", "r & r^2 correlation"],
      },
      {
        id: "stat-3",
        slug: "two-var-stats",
        title: "2-Variable Joint Statistics",
        difficulty: "Intermediate",
        estimatedMinutes: 7,
        description: "Compute joint statistics, sum of products, and independent means for two data sets.",
        presetProblem: "2-Var Stats (2,4) (3,6) (5,10)",
        keySkills: ["L1 & L2 data", "2-Var Stats", "Joint summaries"],
      },
    ],
  },
  {
    id: "probability",
    title: "Probability & Distributions",
    description: "Calculate normal distribution areas, percentiles with invNorm, and binomial probabilities.",
    icon: "🎲",
    badge: "AP Statistics",
    lessons: [
      {
        id: "prob-1",
        slug: "normal-cdf",
        title: "Normal Probability & Areas (normalcdf)",
        difficulty: "Intermediate",
        estimatedMinutes: 7,
        description: "Find probabilities under a standard or custom normal curve between bounds.",
        presetProblem: "area between z = 1 and z = 2",
        keySkills: ["2nd VARS (DISTR)", "normalcdf(", "Lower/Upper bounds"],
      },
      {
        id: "prob-2",
        slug: "inverse-normal",
        title: "Inverse Normal Percentiles (invNorm)",
        difficulty: "Intermediate",
        estimatedMinutes: 6,
        description: "Find critical z-scores and data cutoffs given a left-tail area percentile.",
        presetProblem: "invNorm(0.95)",
        keySkills: ["DISTR 3:invNorm", "Percentile area", "Z-score cutoffs"],
      },
      {
        id: "prob-3",
        slug: "binomial-distributions",
        title: "Binomial Distributions (binompdf / binomcdf)",
        difficulty: "Advanced",
        estimatedMinutes: 8,
        description: "Calculate exact and cumulative binomial probabilities for n trials with success rate p.",
        presetProblem: "binompdf(10, 0.5, 5)",
        keySkills: ["binompdf", "binomcdf", "Trials n", "Probability p"],
      },
    ],
  },
];
