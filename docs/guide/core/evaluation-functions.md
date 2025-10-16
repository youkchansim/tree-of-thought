# Evaluation Functions for Tree of Thoughts

Practical implementation guide for thought evaluation functions

## 📚 Evaluation Function Overview

Evaluation functions quantify the quality of generated thoughts to enable optimal path selection.

```yaml
Evaluation Methods:
1. Value Method: Independent evaluation of individual thoughts
2. Vote Method: Comparative evaluation of multiple thoughts
3. Hybrid Evaluation: Cross-evaluation by Claude + Codex
```

---

## 🎯 Method 1: Value Evaluation

### Basic Implementation

```yaml
def get_value(task, x, y, n_evaluate_sample, cache_value=True):
    """
    Evaluate the value of a single thought

    Args:
        task: Task object
        x: Initial problem
        y: Thought to evaluate
        n_evaluate_sample: Number of evaluation iterations
        cache_value: Whether to use caching

    Returns:
        float: Evaluation score (0.0 ~ 20.0)
    """

    # Check cache
    cache_key = hash(x + y['text'])
    if cache_value and cache_key in value_cache:
        return value_cache[cache_key]

    # Generate evaluation prompt
    eval_prompt = task.get_value_prompt(x, y['text'])

    # Perform n evaluations
    scores = []
    for i in range(n_evaluate_sample):
        # Call LLM (low temperature for consistency)
        response = call_llm(
            prompt=eval_prompt,
            temperature=0.3,  # Consistent evaluation
            model=select_evaluator_model(task, y)
        )

        # Parse response
        score = task.parse_value_output(response)
        scores.append(score)

    # Calculate average score
    avg_score = sum(scores) / len(scores)

    # Save to cache
    if cache_value:
        value_cache[cache_key] = avg_score

    return avg_score
```

### Batch Evaluation of Multiple Thoughts

```yaml
def get_values(task, x, ys, n_evaluate_sample, cache_value=True):
    """
    Efficiently evaluate multiple thoughts

    Args:
        ys: List of thoughts to evaluate

    Returns:
        List[float]: Score for each thought
    """

    # Remove duplicates (local caching)
    local_cache = {}
    unique_ys = []
    ys_to_idx = {}

    for i, y in enumerate(ys):
        y_text = y['text']
        if y_text not in local_cache:
            local_cache[y_text] = len(unique_ys)
            unique_ys.append(y)
        ys_to_idx[i] = local_cache[y_text]

    # Evaluate only unique thoughts
    unique_values = []
    for y in unique_ys:
        value = get_value(task, x, y, n_evaluate_sample, cache_value)
        unique_values.append(value)

    # Restore to original order
    values = [unique_values[ys_to_idx[i]] for i in range(len(ys))]

    return values
```

### Hybrid Value Evaluation

```yaml
def get_value_hybrid(task, x, y, n_evaluate_sample):
    """
    Cross-evaluation by Claude and Codex

    Returns:
        Dict: {
            'score': 평균 점수,
            'claude_score': Claude 평가,
            'codex_score': Codex 평가,
            'agreement': 일치도
        }
    """

    eval_prompt = task.get_value_prompt(x, y['text'])

    # Claude evaluation
    claude_scores = []
    for _ in range(n_evaluate_sample):
        response = call_claude(eval_prompt, temperature=0.3)
        score = task.parse_value_output(response)
        claude_scores.append(score)

    claude_avg = sum(claude_scores) / len(claude_scores)

    # Codex evaluation
    codex_scores = []
    for _ in range(n_evaluate_sample):
        response = call_codex(eval_prompt, temperature=0.3)
        score = task.parse_value_output(response)
        codex_scores.append(score)

    codex_avg = sum(codex_scores) / len(codex_scores)

    # Calculate agreement
    agreement = 1.0 - abs(claude_avg - codex_avg) / max(claude_avg, codex_avg, 1.0)

    # Weighted average (higher agreement = more trust)
    if agreement > 0.8:
        # High agreement → average
        final_score = (claude_avg + codex_avg) / 2
    else:
        # Low agreement → select more conservative score
        final_score = min(claude_avg, codex_avg)

    return {
        'score': final_score,
        'claude_score': claude_avg,
        'codex_score': codex_avg,
        'agreement': agreement,
        'details': {
            'claude_scores': claude_scores,
            'codex_scores': codex_scores
        }
    }
```

---

## 🗳️ Method 2: Vote Evaluation

### Voting-Based Evaluation

```yaml
def get_votes(task, x, ys, n_evaluate_sample):
    """
    Determine ranking by comparing multiple thoughts simultaneously

    Args:
        ys: List of thoughts to evaluate (typically 5)

    Returns:
        List[float]: Score for each thought (based on voting results)
    """

    # Generate voting prompt
    vote_prompt = task.get_vote_prompt(x, [y['text'] for y in ys])

    # Perform n votes
    vote_results = []
    for i in range(n_evaluate_sample):
        response = call_llm(
            prompt=vote_prompt,
            temperature=0.5,  # Some diversity
            model='default'
        )

        # Parse vote results: [3, 0, 4, 1, 2] (rankings)
        rankings = task.parse_vote_output(response)
        vote_results.append(rankings)

    # Aggregate votes
    final_scores = aggregate_votes(vote_results, len(ys))

    return final_scores
```

### Vote Aggregation Algorithm

```yaml
def aggregate_votes(vote_results, num_candidates):
    """
    Borda Count voting aggregation

    Args:
        vote_results: [
            [2, 0, 1],  # 1차 투표: 2번이 1위, 0번이 2위, 1번이 3위
            [0, 2, 1],  # 2차 투표
            ...
        ]
        num_candidates: Number of candidates

    Returns:
        List[float]: Final score for each candidate
    """

    # Borda Count: Award points based on ranking
    # 1st place: num_candidates points, 2nd place: num_candidates-1 points, ...

    scores = [0.0] * num_candidates

    for rankings in vote_results:
        for rank, candidate_id in enumerate(rankings):
            # rank 0 (1st place) → num_candidates points
            # rank 1 (2nd place) → num_candidates-1 points
            points = num_candidates - rank
            scores[candidate_id] += points

    # Normalize (0-10 range)
    max_possible_score = num_candidates * len(vote_results)
    normalized_scores = [
        (score / max_possible_score) * 10.0
        for score in scores
    ]

    return normalized_scores
```

### Hybrid Vote Evaluation

```yaml
def get_votes_hybrid(task, x, ys, n_evaluate_sample):
    """
    Claude and Codex each vote separately

    Returns:
        Dict: {
            'scores': 최종 점수,
            'claude_votes': Claude 투표,
            'codex_votes': Codex 투표,
            'consensus': 합의도
        }
    """

    vote_prompt = task.get_vote_prompt(x, [y['text'] for y in ys])

    # Claude voting
    claude_vote_results = []
    for _ in range(n_evaluate_sample):
        response = call_claude(vote_prompt, temperature=0.5)
        rankings = task.parse_vote_output(response)
        claude_vote_results.append(rankings)

    claude_scores = aggregate_votes(claude_vote_results, len(ys))

    # Codex voting
    codex_vote_results = []
    for _ in range(n_evaluate_sample):
        response = call_codex(vote_prompt, temperature=0.5)
        rankings = task.parse_vote_output(response)
        codex_vote_results.append(rankings)

    codex_scores = aggregate_votes(codex_vote_results, len(ys))

    # Calculate consensus: rank correlation between two models
    consensus = calculate_rank_correlation(claude_scores, codex_scores)

    # Final score: weighted average
    if consensus > 0.7:
        # High consensus → equal weighting
        final_scores = [
            (c + x) / 2
            for c, x in zip(claude_scores, codex_scores)
        ]
    else:
        # Low consensus → prioritize practicality (Claude weighted)
        final_scores = [
            c * 0.6 + x * 0.4
            for c, x in zip(claude_scores, codex_scores)
        ]

    return {
        'scores': final_scores,
        'claude_scores': claude_scores,
        'codex_scores': codex_scores,
        'consensus': consensus
    }
```

---

## 🔄 Method 3: Cross-Evaluation

### Separating Generator and Evaluator

```yaml
def cross_evaluate(task, x, ys, n_evaluate_sample):
    """
    Cross-assign generation model and evaluation model

    Principle:
    - Claude-generated thoughts → Codex evaluation
    - Codex-generated thoughts → Claude evaluation

    Benefits:
    - Reduced bias
    - Improved objectivity
    - Multi-angle verification
    """

    cross_scores = []

    for y in ys:
        generator_model = y['model']  # 'claude' or 'codex'

        # Evaluate with opposite model
        if generator_model == 'claude':
            evaluator = call_codex
        else:
            evaluator = call_claude

        eval_prompt = task.get_value_prompt(x, y['text'])

        # Perform evaluation
        scores = []
        for _ in range(n_evaluate_sample):
            response = evaluator(eval_prompt, temperature=0.3)
            score = task.parse_value_output(response)
            scores.append(score)

        avg_score = sum(scores) / len(scores)

        cross_scores.append({
            'thought_id': y['id'],
            'generator': generator_model,
            'evaluator': 'codex' if generator_model == 'claude' else 'claude',
            'score': avg_score
        })

    return cross_scores
```

---

## 📊 Score Normalization

### Unifying Score Ranges

```yaml
def normalize_scores(scores, method='minmax'):
    """
    Normalize scores of various ranges to 0-10

    Args:
        scores: List of original scores
        method: 'minmax', 'zscore', 'sigmoid'
    """

    import numpy as np

    scores_array = np.array(scores)

    if method == 'minmax':
        # Min-Max normalization
        min_score = scores_array.min()
        max_score = scores_array.max()

        if max_score - min_score < 0.001:
            # All scores are identical
            return [5.0] * len(scores)

        normalized = (scores_array - min_score) / (max_score - min_score) * 10.0

    elif method == 'zscore':
        # Z-Score normalization then map to 0-10
        mean = scores_array.mean()
        std = scores_array.std()

        if std < 0.001:
            return [5.0] * len(scores)

        z_scores = (scores_array - mean) / std
        # Map -3 ~ +3 range to 0-10
        normalized = (z_scores + 3) / 6 * 10.0
        normalized = np.clip(normalized, 0.0, 10.0)

    elif method == 'sigmoid':
        # Sigmoid normalization
        def sigmoid(x):
            return 1 / (1 + np.exp(-x))

        # Center around mean
        centered = scores_array - scores_array.mean()
        normalized = sigmoid(centered) * 10.0

    return normalized.tolist()
```

---

## 🎯 Measuring Evaluation Reliability

### Evaluation Consistency Check

```yaml
def evaluate_confidence(scores_per_thought):
    """
    Measure consistency of multiple evaluation results

    Args:
        scores_per_thought: {
            'thought_1': [8.5, 8.3, 8.7],  # 3회 평가
            'thought_2': [7.9, 8.1, 7.8],
            ...
        }

    Returns:
        Dict: {
            'thought_id': {
                'mean': 평균 점수,
                'std': 표준편차,
                'confidence': 신뢰도 (0-1)
            }
        }
    """

    import numpy as np

    confidences = {}

    for thought_id, scores in scores_per_thought.items():
        scores_array = np.array(scores)

        mean_score = scores_array.mean()
        std_score = scores_array.std()

        # Calculate confidence: lower std = higher confidence
        # std of 0 → confidence = 1, std of 3 → confidence ≈ 0
        confidence = 1.0 / (1.0 + std_score)

        confidences[thought_id] = {
            'mean': mean_score,
            'std': std_score,
            'confidence': confidence,
            'raw_scores': scores
        }

    return confidences
```

---

## ⚡ Performance Optimization

### 1. Parallel Evaluation

```yaml
from concurrent.futures import ThreadPoolExecutor, as_completed

def evaluate_parallel(task, x, ys, n_evaluate_sample, max_workers=5):
    """
    Evaluate multiple thoughts in parallel

    Effect: Reduce evaluation time to 1/max_workers
    """

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit evaluation tasks
        future_to_thought = {
            executor.submit(
                get_value,
                task, x, y, n_evaluate_sample
            ): y
            for y in ys
        }

        # Collect results
        results = []
        for future in as_completed(future_to_thought):
            y = future_to_thought[future]
            try:
                score = future.result()
                results.append((y, score))
            except Exception as e:
                # Error handling
                results.append((y, 0.0))

    # Sort back to original order
    results.sort(key=lambda item: ys.index(item[0]))
    scores = [score for _, score in results]

    return scores
```

### 2. Caching Strategy

```yaml
# Global cache
value_cache = {}

# Session cache
session_cache = {}

def get_cached_value(cache_key, ttl=3600):
    """
    Time-To-Live based caching

    Args:
        cache_key: Cache key
        ttl: Expiration time (seconds)
    """

    import time

    if cache_key in value_cache:
        cached_data, timestamp = value_cache[cache_key]

        # Check expiration
        if time.time() - timestamp < ttl:
            return cached_data
        else:
            # Delete expired cache
            del value_cache[cache_key]

    return None

def set_cached_value(cache_key, value):
    """Save to cache"""
    import time

    value_cache[cache_key] = (value, time.time())
```

### 3. Early Stopping

```yaml
def evaluate_with_early_stopping(
    task, x, ys, n_evaluate_sample, confidence_threshold=0.95
):
    """
    Stop evaluation when sufficiently good thought is found

    Effect: Skip unnecessary evaluations, save tokens
    """

    scored_thoughts = []

    for y in ys:
        # Perform evaluation
        scores = []
        for i in range(n_evaluate_sample):
            score = evaluate_single(task, x, y)
            scores.append(score)

            # Intermediate check: already sufficiently good score
            if i >= 1:  # Minimum 2 evaluations
                avg_so_far = sum(scores) / len(scores)
                if avg_so_far >= confidence_threshold * 10:
                    # High enough, no need for additional evaluation
                    break

        avg_score = sum(scores) / len(scores)
        scored_thoughts.append((y, avg_score))

        # Overall early stopping: found near-perfect thought
        if avg_score >= confidence_threshold * 10:
            # Assign low scores to remaining thoughts and stop
            for remaining_y in ys[len(scored_thoughts):]:
                scored_thoughts.append((remaining_y, 0.0))
            break

    scores = [score for _, score in scored_thoughts]
    return scores
```

---

## 🔧 Unified Evaluation Function Interface

```yaml
class Evaluator:
    """Unified evaluation function class"""

    def __init__(self, task, method='value', hybrid=True):
        self.task = task
        self.method = method  # 'value' or 'vote'
        self.hybrid = hybrid

    def evaluate(self, x, ys, n_evaluate_sample=3):
        """
        Unified evaluation interface

        Returns:
            List[float] or Dict: Evaluation results
        """

        if self.method == 'value':
            if self.hybrid:
                results = [
                    get_value_hybrid(self.task, x, y, n_evaluate_sample)
                    for y in ys
                ]
                scores = [r['score'] for r in results]
            else:
                scores = get_values(self.task, x, ys, n_evaluate_sample)

        elif self.method == 'vote':
            if self.hybrid:
                result = get_votes_hybrid(self.task, x, ys, n_evaluate_sample)
                scores = result['scores']
            else:
                scores = get_votes(self.task, x, ys, n_evaluate_sample)

        return scores
```

---

## ✅ Evaluation Function Checklist

```yaml
Required Implementation:
  ✅ get_value() - Value evaluation
  ✅ get_values() - Batch evaluation
  ✅ get_votes() - Vote evaluation
  ✅ aggregate_votes() - Vote aggregation
  ✅ Caching mechanism
  ✅ Hybrid evaluation

Optimization:
  ✅ Parallel processing
  ✅ Early stopping
  ✅ Score normalization
  ✅ Confidence measurement

Integration:
  ✅ Evaluator class
  ✅ Task interface integration
  ✅ Algorithm (BFS/DFS) integration
```

---

*Princeton-style evaluation functions + Hybrid optimization complete*
