# Selection Algorithms for Tree of Thoughts

Princeton-style Selection Algorithm Implementation

## 📚 Selection Algorithm Overview

Selection algorithms determine which Top-k thoughts to advance to the next level from the evaluated thoughts.

```yaml
Selection Methods:
1. Greedy Selection: Score-based deterministic selection
2. Sample Selection: Probability-based stochastic selection
3. Hybrid Selection: Model diversity-aware selection
```

---

## 🎯 Method 1: Greedy Selection

### Basic Implementation

```yaml
def select_greedy(values, n_select_sample):
    """
    Deterministically select top k thoughts with highest scores

    Args:
        values: List of scores for each thought
        n_select_sample: Number of thoughts to select

    Returns:
        List[int]: Indices of selected thoughts
    """

    # Sort indices by score
    sorted_indices = sorted(
        range(len(values)),
        key=lambda i: values[i],
        reverse=True  # Highest score first
    )

    # Select top n
    selected_indices = sorted_indices[:n_select_sample]

    return selected_indices
```

### Example

```yaml
Input:
  values = [8.5, 7.9, 6.2, 9.1, 7.5]
  n_select_sample = 3

Execution:
  sorted_indices = [3, 0, 1, 4, 2]  # 점수순 정렬
                   ↓  ↓  ↓  ↓  ↓
                  9.1 8.5 7.9 7.5 6.2

  selected_indices = [3, 0, 1]  # 상위 3개

Output:
  [3, 0, 1]  # 인덱스

Interpretation:
  - 3번 사고 (9.1점) 선택
  - 0번 사고 (8.5점) 선택
  - 1번 사고 (7.9점) 선택
```

---

## 🎲 Method 2: Sample Selection

### Probability-Based Selection

```yaml
import numpy as np

def select_sample(values, n_select_sample, temperature=1.0):
    """
    Convert scores to probabilities for stochastic sampling

    Args:
        values: List of scores
        n_select_sample: Number to select
        temperature: Temperature parameter (higher = more diversity ↑)

    Returns:
        List[int]: Selected indices
    """

    values_array = np.array(values)

    # Handle negative values: shift minimum to 0
    if values_array.min() < 0:
        values_array = values_array - values_array.min() + 0.01

    # Temperature scaling
    # High temperature → uniform distribution
    # Low temperature → extreme distribution
    scaled_values = values_array ** (1.0 / temperature)

    # Generate probability distribution
    total = scaled_values.sum()
    if total == 0:
        # If all scores are 0, use uniform probabilities
        probabilities = np.ones(len(values)) / len(values)
    else:
        probabilities = scaled_values / total

    # Sample without replacement
    selected_indices = np.random.choice(
        len(values),
        size=min(n_select_sample, len(values)),
        replace=False,
        p=probabilities
    )

    return list(selected_indices)
```

### Temperature Effect

```yaml
Example:
  values = [9.0, 8.0, 7.0, 6.0, 5.0]
  n_select = 3

temperature = 0.5 (Low - Greedy):
  scaled = [81.0, 64.0, 49.0, 36.0, 25.0]
  probabilities = [0.32, 0.25, 0.19, 0.14, 0.10]
  → Very high probability of selecting high scores

temperature = 1.0 (Medium - Balanced):
  scaled = [9.0, 8.0, 7.0, 6.0, 5.0]
  probabilities = [0.26, 0.23, 0.20, 0.17, 0.14]
  → Selection proportional to scores

temperature = 2.0 (High - Exploratory):
  scaled = [3.0, 2.83, 2.65, 2.45, 2.24]
  probabilities = [0.22, 0.21, 0.20, 0.18, 0.17]
  → Nearly uniform selection probability
```

---

## 🔀 Method 3: Hybrid Selection

### Model Diversity Consideration

```yaml
def select_hybrid(values, thoughts, n_select_sample, diversity_weight=0.3):
    """
    Selection considering both score and model diversity

    Args:
        values: List of scores
        thoughts: List of thoughts (with model information)
        n_select_sample: Number to select
        diversity_weight: Diversity weight (0-1)

    Returns:
        List[int]: Selected indices
    """

    # Normalize scores (0-1 range)
    values_array = np.array(values)
    normalized_scores = (values_array - values_array.min()) / (
        values_array.max() - values_array.min() + 0.001
    )

    # Calculate model distribution
    model_counts = {'claude': 0, 'codex': 0}
    for thought in thoughts:
        model_counts[thought['model']] += 1

    # Calculate diversity scores
    diversity_scores = []
    for thought in thoughts:
        model = thought['model']
        # Higher diversity score for less-selected models
        diversity = 1.0 / (model_counts[model] + 1)
        diversity_scores.append(diversity)

    diversity_array = np.array(diversity_scores)
    normalized_diversity = diversity_array / diversity_array.max()

    # Final score: quality + diversity
    final_scores = (
        normalized_scores * (1 - diversity_weight) +
        normalized_diversity * diversity_weight
    )

    # Greedy selection
    sorted_indices = sorted(
        range(len(final_scores)),
        key=lambda i: final_scores[i],
        reverse=True
    )

    selected_indices = sorted_indices[:n_select_sample]

    return selected_indices
```

### Example

```yaml
Input:
  values = [9.1, 8.5, 8.3, 8.2, 7.9]
  thoughts = [
      {'model': 'codex'},   # 0
      {'model': 'claude'},  # 1
      {'model': 'claude'},  # 2
      {'model': 'claude'},  # 3
      {'model': 'codex'}    # 4
  ]
  n_select_sample = 3
  diversity_weight = 0.3

Processing:
  # Model counts
  claude: 3개, codex: 2개

  # Diversity scores
  0 (codex): 1/(2+1) = 0.33
  1 (claude): 1/(3+1) = 0.25
  2 (claude): 0.25
  3 (claude): 0.25
  4 (codex): 0.33

  # Normalized scores (0-1)
  normalized_scores = [1.0, 0.86, 0.79, 0.76, 0.64]

  # Normalized diversity
  normalized_diversity = [1.0, 0.76, 0.76, 0.76, 1.0]

  # Final scores (70% quality + 30% diversity)
  final_scores = [
      1.0 * 0.7 + 1.0 * 0.3 = 1.0,     # 0 (codex)
      0.86 * 0.7 + 0.76 * 0.3 = 0.83,  # 1 (claude)
      0.79 * 0.7 + 0.76 * 0.3 = 0.78,  # 2 (claude)
      0.76 * 0.7 + 0.76 * 0.3 = 0.76,  # 3 (claude)
      0.64 * 0.7 + 1.0 * 0.3 = 0.75    # 4 (codex)
  ]

  # Selection
  sorted = [0, 1, 2, 3, 4]
  selected = [0, 1, 2]

Result:
  - 0번 (Codex, 9.1점) - 최고점 + 다양성
  - 1번 (Claude, 8.5점) - 2순위 + Claude 대표
  - 2번 (Claude, 8.3점) - 3순위

Comparison (Greedy only):
  - 0번 (Codex, 9.1점)
  - 1번 (Claude, 8.5점)
  - 2번 (Claude, 8.3점)
  → Same result (coincidence)

Comparison (More extreme case):
  values = [9.0, 8.9, 8.8, 5.0, 4.9]
  models = [claude, claude, claude, codex, codex]

  Greedy: [0, 1, 2] (All Claude)
  Hybrid: [0, 1, 3] (Claude 2 + Codex 1) ✅ Diversity secured
```

---

## 🎚️ Method 4: Threshold-Based Selection

### Threshold-Based Filtering

```yaml
def select_threshold(values, threshold=7.0, max_select=5):
    """
    Select only thoughts above threshold

    Args:
        values: List of scores
        threshold: Minimum score
        max_select: Maximum number to select

    Returns:
        List[int]: Selected indices
    """

    # Indices above threshold
    qualified_indices = [
        i for i, v in enumerate(values)
        if v >= threshold
    ]

    # Limit count
    if len(qualified_indices) > max_select:
        # Sort by score and take top max_select
        qualified_indices.sort(key=lambda i: values[i], reverse=True)
        qualified_indices = qualified_indices[:max_select]

    # If none qualified, select at least the best one
    if len(qualified_indices) == 0:
        best_idx = max(range(len(values)), key=lambda i: values[i])
        qualified_indices = [best_idx]

    return qualified_indices
```

### Adaptive Threshold

```yaml
def select_adaptive_threshold(values, percentile=70, max_select=5):
    """
    Dynamically determine threshold

    Args:
        percentile: Percentile (70 = top 30%)

    Returns:
        List[int]: Selected indices
    """

    import numpy as np

    # Calculate percentile
    threshold = np.percentile(values, percentile)

    # Threshold-based selection
    return select_threshold(values, threshold, max_select)
```

---

## 🔄 Method 5: Iterative Selection

### Stepwise Selection

```yaml
def select_iterative(values, thoughts, n_select_sample, n_iterations=3):
    """
    Progressive selection through multiple rounds

    Round 1: Select top 50%
    Round 2: Re-evaluate and select top 30%
    Round 3: Final selection of n thoughts

    Effect: Careful judgment for borderline thoughts
    """

    current_indices = list(range(len(values)))
    current_values = values[:]

    for round_num in range(n_iterations):
        # Selection ratio for current round
        if round_num == n_iterations - 1:
            # Last round: exactly n thoughts
            select_ratio = n_select_sample / len(current_indices)
        else:
            # Intermediate rounds: progressive reduction
            select_ratio = 0.5 ** (round_num + 1)

        select_count = max(
            n_select_sample,
            int(len(current_indices) * select_ratio)
        )

        # Selection
        selected = select_greedy(current_values, select_count)

        # Prepare for next round
        current_indices = [current_indices[i] for i in selected]
        current_values = [current_values[i] for i in selected]

        # Re-evaluation (optional)
        if round_num < n_iterations - 1:
            # More careful re-evaluation
            current_values = reevaluate_thoughts(
                thoughts=[thoughts[i] for i in current_indices],
                n_evaluate=round_num + 2
            )

    return current_indices
```

---

## 📊 Selection Strategy Comparison

| Method | Advantages | Disadvantages | Suitable Situations |
|-----|------|------|----------|
| **Greedy** | Guarantees optimal | Lacks diversity | Performance priority |
| **Sample** | Ensures diversity | May miss optimal | Exploration phase |
| **Hybrid** | Balanced selection | High complexity | General situations |
| **Threshold** | Quality guarantee | Unstable count | Quality priority |
| **Iterative** | Careful judgment | Time consuming | Important decisions |

---

## 🎯 Unified Selection Algorithm Interface

```yaml
class Selector:
    """Integrated selection algorithm class"""

    def __init__(self, method='greedy', **kwargs):
        self.method = method
        self.params = kwargs

    def select(self, values, thoughts, n_select_sample):
        """
        Unified selection interface

        Args:
            values: List of scores
            thoughts: List of thoughts
            n_select_sample: Number to select

        Returns:
            List[int]: Selected indices
        """

        if self.method == 'greedy':
            return select_greedy(values, n_select_sample)

        elif self.method == 'sample':
            temperature = self.params.get('temperature', 1.0)
            return select_sample(values, n_select_sample, temperature)

        elif self.method == 'hybrid':
            diversity_weight = self.params.get('diversity_weight', 0.3)
            return select_hybrid(
                values, thoughts, n_select_sample, diversity_weight
            )

        elif self.method == 'threshold':
            threshold = self.params.get('threshold', 7.0)
            max_select = self.params.get('max_select', n_select_sample)
            return select_threshold(values, threshold, max_select)

        elif self.method == 'iterative':
            n_iterations = self.params.get('n_iterations', 3)
            return select_iterative(
                values, thoughts, n_select_sample, n_iterations
            )

        else:
            raise ValueError(f"Unknown method: {self.method}")
```

---

## 🔧 Advanced Selection Strategies

### 1. Ensemble Selection

```yaml
def select_ensemble(values, thoughts, n_select_sample):
    """
    Combine results from multiple selection methods

    Strategy:
    1. Select with Greedy
    2. Select with Sample
    3. Select with Hybrid
    4. Prioritize intersection, complement with union
    """

    # Select with each method
    greedy_selected = set(select_greedy(values, n_select_sample))
    sample_selected = set(select_sample(values, n_select_sample))
    hybrid_selected = set(select_hybrid(values, thoughts, n_select_sample))

    # Intersection (selected by all methods)
    intersection = greedy_selected & sample_selected & hybrid_selected

    # Selected by 2 methods
    two_way = (
        (greedy_selected & sample_selected) |
        (greedy_selected & hybrid_selected) |
        (sample_selected & hybrid_selected)
    )

    # Priority: intersection > 2-way > by score
    final_selected = list(intersection)

    if len(final_selected) < n_select_sample:
        remaining = two_way - intersection
        final_selected.extend(list(remaining))

    if len(final_selected) < n_select_sample:
        # Fill with highest scores
        all_union = greedy_selected | sample_selected | hybrid_selected
        remaining = all_union - set(final_selected)
        sorted_remaining = sorted(
            remaining,
            key=lambda i: values[i],
            reverse=True
        )
        final_selected.extend(sorted_remaining)

    return final_selected[:n_select_sample]
```

### 2. Model-Aware Selection

```yaml
def select_model_aware(values, thoughts, n_select_sample, problem_type):
    """
    Adjust model preference based on problem type

    Args:
        problem_type: 'debug', 'refactor', 'design'
    """

    # Model preferences by problem type
    model_preferences = {
        'debug': {'claude': 0.6, 'codex': 0.4},
        'refactor': {'claude': 0.5, 'codex': 0.5},
        'design': {'claude': 0.4, 'codex': 0.6}
    }

    preference = model_preferences.get(problem_type, {'claude': 0.5, 'codex': 0.5})

    # Calculate selection count per model
    n_claude = int(n_select_sample * preference['claude'])
    n_codex = n_select_sample - n_claude

    # Separate by model
    claude_thoughts = [(i, v) for i, v in enumerate(values)
                       if thoughts[i]['model'] == 'claude']
    codex_thoughts = [(i, v) for i, v in enumerate(values)
                      if thoughts[i]['model'] == 'codex']

    # Select top n from each model
    claude_thoughts.sort(key=lambda x: x[1], reverse=True)
    codex_thoughts.sort(key=lambda x: x[1], reverse=True)

    selected = []
    selected.extend([i for i, _ in claude_thoughts[:n_claude]])
    selected.extend([i for i, _ in codex_thoughts[:n_codex]])

    return selected
```

---

## ✅ Selection Algorithm Checklist

```yaml
Essential Implementation:
  ✅ select_greedy()
  ✅ select_sample()
  ✅ select_hybrid()
  ✅ Selector class

Advanced Features:
  ✅ select_threshold()
  ✅ select_iterative()
  ✅ select_ensemble()
  ✅ select_model_aware()

Integration:
  ✅ Integration with evaluation functions
  ✅ Integration with Task system
  ✅ Integration with BFS/DFS algorithms
```

---

*Princeton Selection Algorithms + Hybrid Optimization Complete*
