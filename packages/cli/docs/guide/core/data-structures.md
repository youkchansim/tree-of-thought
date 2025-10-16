# ToT Data Structures

Standardized data structures used in the Tree of Thoughts system

## 🎯 Core Concepts

```yaml
Purpose:
  - Consistent data format
  - Type safety
  - Clear interfaces

Structure:
  1. Thought: Individual thought
  2. ToTArgs: Execution parameters
  3. TaskConfig: Task configuration
  4. Evaluation: Evaluation result
  5. SearchResult: Final result
```

---

## 📋 1. Thought (Thought Object)

### Definition

```python
from dataclasses import dataclass, field
from typing import Optional, Dict, Any

@dataclass
class Thought:
    """
    Individual thought (node) in Tree of Thoughts

    Attributes:
        id: Unique identifier (e.g., "claude_0", "codex_1")
        text: Thought content (in Korean)
        model: Generation model ("claude" | "codex")
        depth: Tree depth (starting from 0)
        parent_id: Parent thought ID (None for Level 0)
        score: Evaluation score (0-10, None if not evaluated)
        confidence: Confidence level (0-1, None if not calculated)
        metadata: Additional information dictionary
    """

    id: str
    text: str
    model: str  # "claude" | "codex"
    depth: int

    parent_id: Optional[str] = None
    score: Optional[float] = None
    confidence: Optional[float] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        """Validation logic"""
        assert self.model in ["claude", "codex"], f"Invalid model: {self.model}"
        assert self.depth >= 0, f"Invalid depth: {self.depth}"
        assert len(self.text) > 0, "Text cannot be empty"

        if self.score is not None:
            assert 0 <= self.score <= 10, f"Score must be 0-10: {self.score}"

        if self.confidence is not None:
            assert 0 <= self.confidence <= 1, f"Confidence must be 0-1: {self.confidence}"

    def __repr__(self):
        """Representation for debugging"""
        score_str = f"{self.score:.1f}" if self.score else "N/A"
        conf_str = f"{self.confidence:.0%}" if self.confidence else "N/A"
        return (
            f"Thought(id={self.id}, model={self.model}, depth={self.depth}, "
            f"score={score_str}, conf={conf_str}, text={self.text[:30]}...)"
        )

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary (serialization)"""
        return {
            "id": self.id,
            "text": self.text,
            "model": self.model,
            "depth": self.depth,
            "parent_id": self.parent_id,
            "score": self.score,
            "confidence": self.confidence,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Thought':
        """Create from dictionary (deserialization)"""
        return cls(**data)
```

### Usage Examples

```python
# Level 1: Claude thought
thought1 = Thought(
    id="claude_0",
    text="캐시 메모리 미해제로 인한 누수",
    model="claude",
    depth=0,
    metadata={
        "reasoning": "Redis 연결 후 close() 미호출",
        "possibility": 8
    }
)

# Level 1: Codex thought (evaluated)
thought2 = Thought(
    id="codex_1",
    text="setInterval/setTimeout 미정리",
    model="codex",
    depth=0,
    score=9.1,
    confidence=0.92,
    metadata={
        "reasoning": "Timer는 명시적 clear 필요",
        "evaluation_count": 3
    }
)

# Level 2: Child thought
thought3 = Thought(
    id="codex_3",
    text="Chrome DevTools Memory Profiler 사용",
    model="codex",
    depth=1,
    parent_id="codex_1",
    score=9.5,
    confidence=0.95
)

print(thought1)
# Thought(id=claude_0, model=claude, depth=0, score=N/A, conf=N/A, text=캐시 메모리 미해제로 인한 누수...)

print(thought2.to_dict())
# {'id': 'codex_1', 'text': 'setInterval/setTimeout 미정리', ...}
```

---

## 📋 2. ToTArgs (Execution Parameters)

### Definition

```python
@dataclass
class ToTArgs:
    """
    ToT algorithm execution parameters

    Based on parameters from Princeton NLP paper

    Attributes:
        n_generate_sample: Number of thoughts to generate (b in paper)
        n_evaluate_sample: Number of evaluations per thought
        n_select_sample: Number of thoughts to select
        max_depth: Maximum tree depth
        algorithm: Search algorithm ("BFS" | "DFS")
        method_generate: Generation method ("propose" | "sample")
        method_evaluate: Evaluation method ("value" | "vote")
        method_select: Selection method ("greedy" | "sample" | "hybrid")
        ratio: Claude:Codex ratio (Hybrid only, e.g., "5:5")
        confidence_threshold: Early stopping threshold (0-10)
        enable_cache: Enable caching
        enable_parallel: Enable parallel processing
    """

    # Princeton core parameters
    n_generate_sample: int = 5
    n_evaluate_sample: int = 3
    n_select_sample: int = 3
    max_depth: int = 3

    # Algorithm selection
    algorithm: str = "BFS"  # "BFS" | "DFS"
    method_generate: str = "propose"  # "propose" | "sample"
    method_evaluate: str = "value"  # "value" | "vote"
    method_select: str = "greedy"  # "greedy" | "sample" | "hybrid"

    # Hybrid mode
    ratio: str = "5:5"  # "Claude:Codex" (e.g., "7:3", "5:5", "3:7")

    # Optimization
    confidence_threshold: float = 9.0  # Early stopping score
    enable_cache: bool = True
    enable_parallel: bool = True

    def __post_init__(self):
        """Validation logic"""
        assert self.n_generate_sample > 0
        assert self.n_evaluate_sample > 0
        assert self.n_select_sample > 0
        assert self.n_select_sample <= self.n_generate_sample
        assert self.max_depth > 0

        assert self.algorithm in ["BFS", "DFS"]
        assert self.method_generate in ["propose", "sample"]
        assert self.method_evaluate in ["value", "vote"]
        assert self.method_select in ["greedy", "sample", "hybrid"]

        assert 0 <= self.confidence_threshold <= 10

    def parse_ratio(self) -> tuple[float, float]:
        """
        Parse ratio string

        Returns:
            (claude_ratio, codex_ratio) as floats (0-1)

        Example:
            "5:5" → (0.5, 0.5)
            "7:3" → (0.7, 0.3)
        """
        parts = self.ratio.split(":")
        assert len(parts) == 2, f"Invalid ratio format: {self.ratio}"

        claude = int(parts[0])
        codex = int(parts[1])
        total = claude + codex

        return (claude / total, codex / total)

    def get_claude_count(self) -> int:
        """Number of Claude thoughts to generate"""
        claude_ratio, _ = self.parse_ratio()
        return int(self.n_generate_sample * claude_ratio)

    def get_codex_count(self) -> int:
        """Number of Codex thoughts to generate"""
        _, codex_ratio = self.parse_ratio()
        return int(self.n_generate_sample * codex_ratio)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "n_generate_sample": self.n_generate_sample,
            "n_evaluate_sample": self.n_evaluate_sample,
            "n_select_sample": self.n_select_sample,
            "max_depth": self.max_depth,
            "algorithm": self.algorithm,
            "method_generate": self.method_generate,
            "method_evaluate": self.method_evaluate,
            "method_select": self.method_select,
            "ratio": self.ratio,
            "confidence_threshold": self.confidence_threshold,
            "enable_cache": self.enable_cache,
            "enable_parallel": self.enable_parallel
        }
```

### Usage Examples

```python
# Default settings
args_default = ToTArgs()
print(args_default.get_claude_count())  # 2 (50% of 5)
print(args_default.get_codex_count())   # 2 (50% of 5)

# Urgent bug fix (Claude priority, fast search)
args_urgent = ToTArgs(
    n_generate_sample=3,
    n_select_sample=2,
    max_depth=2,
    algorithm="DFS",
    ratio="7:3",
    confidence_threshold=8.5
)
print(args_urgent.get_claude_count())  # 2 (70% of 3)
print(args_urgent.get_codex_count())   # 0 (30% of 3 → rounded)

# Complex architecture design (Codex priority, deep search)
args_design = ToTArgs(
    n_generate_sample=7,
    n_evaluate_sample=5,
    n_select_sample=3,
    max_depth=5,
    algorithm="BFS",
    method_evaluate="vote",
    method_select="hybrid",
    ratio="3:7",
    confidence_threshold=9.5
)
print(args_design.get_claude_count())  # 2 (30% of 7)
print(args_design.get_codex_count())   # 4 (70% of 7)
```

---

## 📋 3. TaskConfig (Task Configuration)

### Definition

```python
@dataclass
class TaskConfig:
    """
    Configuration per task type (DebugTask, RefactorTask, DesignTask)

    Attributes:
        task_type: Task type
        steps: Number of steps
        step_names: List of step names
        default_args: Default ToTArgs
        prompt_templates: Prompt templates per step
    """

    task_type: str  # "debug" | "refactor" | "design" | "custom"
    steps: int
    step_names: list[str]
    default_args: ToTArgs
    prompt_templates: Dict[str, str] = field(default_factory=dict)

    def __post_init__(self):
        """Validation"""
        assert len(self.step_names) == self.steps
        assert self.task_type in ["debug", "refactor", "design", "custom"]

    def get_step_name(self, depth: int) -> str:
        """Return step name corresponding to depth"""
        if depth < len(self.step_names):
            return self.step_names[depth]
        return f"Step {depth + 1}"
```

### Usage Examples

```python
# DebugTask configuration
debug_config = TaskConfig(
    task_type="debug",
    steps=4,
    step_names=[
        "원인 분석",
        "검증 방법",
        "수정 방안",
        "테스트 계획"
    ],
    default_args=ToTArgs(
        n_generate_sample=5,
        ratio="6:4",  # Claude priority (practicality)
        confidence_threshold=9.0
    ),
    prompt_templates={
        "step_0": "다음 버그의 가능한 원인을 {n}가지 분석하세요:\n{problem}",
        "step_1": "다음 원인을 검증할 방법을 제안하세요:\n{cause}",
        "step_2": "다음 원인을 수정하는 방안을 제시하세요:\n{cause}",
        "step_3": "다음 수정을 테스트할 계획을 작성하세요:\n{fix}"
    }
)

# RefactorTask configuration
refactor_config = TaskConfig(
    task_type="refactor",
    steps=5,
    step_names=[
        "현황 분석",
        "목표 설정",
        "전략 수립",
        "실행 계획",
        "검증 방법"
    ],
    default_args=ToTArgs(
        n_generate_sample=5,
        n_evaluate_sample=3,
        ratio="5:5",  # Balanced
        algorithm="BFS"
    )
)

# DesignTask configuration
design_config = TaskConfig(
    task_type="design",
    steps=6,
    step_names=[
        "요구사항 분석",
        "아키텍처 패턴",
        "컴포넌트 설계",
        "인터페이스 정의",
        "데이터 흐름",
        "확장성 고려"
    ],
    default_args=ToTArgs(
        n_generate_sample=7,
        n_evaluate_sample=5,
        ratio="4:6",  # Codex priority (technical)
        method_evaluate="vote",
        confidence_threshold=9.5
    )
)

print(debug_config.get_step_name(0))  # "원인 분석"
print(refactor_config.get_step_name(2))  # "전략 수립"
```

---

## 📋 4. Evaluation (Evaluation Result)

### Definition

```python
@dataclass
class Evaluation:
    """
    Evaluation result for a thought

    Attributes:
        thought_id: ID of the thought being evaluated
        overall_score: Overall score (0-10)
        confidence: Confidence level (0-1)
        breakdown: Detailed scores
        evaluator: Evaluator ("claude" | "codex" | "hybrid")
        evaluation_count: Number of evaluations
        raw_scores: List of individual evaluation scores
    """

    thought_id: str
    overall_score: float
    confidence: float
    evaluator: str  # "claude" | "codex" | "hybrid"

    breakdown: Dict[str, float] = field(default_factory=dict)
    evaluation_count: int = 1
    raw_scores: list[float] = field(default_factory=list)

    def __post_init__(self):
        """Validation"""
        assert 0 <= self.overall_score <= 10
        assert 0 <= self.confidence <= 1
        assert self.evaluator in ["claude", "codex", "hybrid"]

    def add_score(self, score: float):
        """Add evaluation score and recalculate"""
        self.raw_scores.append(score)
        self.evaluation_count = len(self.raw_scores)
        self.overall_score = sum(self.raw_scores) / self.evaluation_count
        self.confidence = self._calculate_confidence()

    def _calculate_confidence(self) -> float:
        """
        Calculate confidence (based on score consistency)

        Lower variance → higher confidence
        """
        if len(self.raw_scores) < 2:
            return 0.8  # Default value

        import statistics
        variance = statistics.variance(self.raw_scores)

        # Variance 0-4 → Confidence 1.0-0.5
        confidence = max(0.5, 1.0 - (variance / 8))
        return round(confidence, 2)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "thought_id": self.thought_id,
            "overall_score": self.overall_score,
            "confidence": self.confidence,
            "evaluator": self.evaluator,
            "breakdown": self.breakdown,
            "evaluation_count": self.evaluation_count,
            "raw_scores": self.raw_scores
        }
```

### Usage Examples

```python
# Create evaluation object
eval1 = Evaluation(
    thought_id="claude_0",
    overall_score=8.3,
    confidence=0.88,
    evaluator="claude",
    breakdown={
        "feasibility": 8.0,
        "impact": 9.0,
        "risk": 3.0,
        "complexity": 5.0
    },
    raw_scores=[8.2, 8.5, 8.3]
)

# Add evaluations
eval2 = Evaluation(
    thought_id="codex_1",
    overall_score=9.0,
    confidence=0.85,
    evaluator="hybrid"
)

eval2.add_score(9.2)  # 2nd evaluation
eval2.add_score(9.1)  # 3rd evaluation
print(eval2.overall_score)  # 9.1 (recalculated average)
print(eval2.confidence)     # 0.95 (high confidence due to low variance)

# Convert to dictionary
print(eval1.to_dict())
```

---

## 📋 5. SearchResult (Final Result)

### Definition

```python
@dataclass
class SearchResult:
    """
    ToT search final result

    Attributes:
        best_thought: Optimal thought
        path: Path from root to optimal thought
        all_thoughts: List of all explored thoughts
        evaluations: All evaluation results
        metadata: Execution metadata
    """

    best_thought: Thought
    path: list[Thought]
    all_thoughts: list[Thought]
    evaluations: Dict[str, Evaluation]

    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        """Validation"""
        assert self.best_thought in self.path
        assert self.best_thought in self.all_thoughts
        assert self.best_thought.id in self.evaluations

    def get_path_ids(self) -> list[str]:
        """List of thought IDs in path"""
        return [t.id for t in self.path]

    def get_path_scores(self) -> list[float]:
        """List of scores in path"""
        return [
            self.evaluations[t.id].overall_score
            for t in self.path
        ]

    def get_model_distribution(self) -> Dict[str, int]:
        """Number of thoughts per model"""
        from collections import Counter
        return dict(Counter(t.model for t in self.all_thoughts))

    def get_depth_distribution(self) -> Dict[int, int]:
        """Number of thoughts per depth"""
        from collections import Counter
        return dict(Counter(t.depth for t in self.all_thoughts))

    def to_summary(self) -> str:
        """Result summary text"""
        path_str = " → ".join(self.get_path_ids())
        scores_str = " → ".join(f"{s:.1f}" for s in self.get_path_scores())

        model_dist = self.get_model_distribution()

        summary = f"""
=== ToT Search Result ===

Best Thought:
  ID: {self.best_thought.id}
  Model: {self.best_thought.model}
  Score: {self.evaluations[self.best_thought.id].overall_score:.1f}
  Confidence: {self.evaluations[self.best_thought.id].confidence:.0%}

Optimal Path:
  {path_str}

Path Scores:
  {scores_str}

Statistics:
  Total thoughts: {len(self.all_thoughts)}
  Claude: {model_dist.get('claude', 0)}
  Codex: {model_dist.get('codex', 0)}
  Max depth: {max(t.depth for t in self.all_thoughts)}

Content:
{self.best_thought.text}
"""
        return summary.strip()

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "best_thought": self.best_thought.to_dict(),
            "path": [t.to_dict() for t in self.path],
            "all_thoughts": [t.to_dict() for t in self.all_thoughts],
            "evaluations": {
                tid: ev.to_dict()
                for tid, ev in self.evaluations.items()
            },
            "metadata": self.metadata
        }
```

### Usage Examples

```python
# Create search result
result = SearchResult(
    best_thought=thought3,  # codex_3 (score 9.5)
    path=[thought2, thought3],  # codex_1 → codex_3
    all_thoughts=[thought1, thought2, thought3, ...],  # 15 thoughts
    evaluations={
        "claude_0": eval1,
        "codex_1": eval2,
        "codex_3": eval3,
        ...
    },
    metadata={
        "algorithm": "BFS",
        "total_time": 85.3,
        "early_stopped": True,
        "stopped_at_depth": 2
    }
)

# Print summary
print(result.to_summary())

# Statistics
print(result.get_model_distribution())
# {'claude': 8, 'codex': 7}

print(result.get_depth_distribution())
# {0: 5, 1: 6, 2: 4}

print(result.get_path_ids())
# ['codex_1', 'codex_3']

print(result.get_path_scores())
# [9.1, 9.5]
```

---

## 🔄 Data Flow

### Complete Pipeline

```python
# 1. Set parameters
args = ToTArgs(
    n_generate_sample=5,
    ratio="5:5"
)

# 2. Configure task
config = TaskConfig(
    task_type="debug",
    steps=4,
    step_names=["원인 분석", "검증", "수정", "테스트"],
    default_args=args
)

# 3. Generate thoughts
thoughts = [
    Thought(id="claude_0", text="...", model="claude", depth=0),
    Thought(id="codex_1", text="...", model="codex", depth=0),
    ...
]

# 4. Evaluate
evaluations = {
    "claude_0": Evaluation(
        thought_id="claude_0",
        overall_score=8.3,
        confidence=0.88,
        evaluator="claude",
        raw_scores=[8.2, 8.5, 8.3]
    ),
    ...
}

# 5. Select
selected = select_top_k(thoughts, evaluations, k=3)

# 6. Generate next level
level2_thoughts = [
    Thought(
        id="claude_3",
        text="...",
        model="claude",
        depth=1,
        parent_id="claude_0"
    ),
    ...
]

# 7. Final result
result = SearchResult(
    best_thought=selected[0],
    path=[thoughts[0], level2_thoughts[0]],
    all_thoughts=thoughts + level2_thoughts,
    evaluations=evaluations,
    metadata={"total_time": 85}
)

# 8. Output
print(result.to_summary())
```

---

## 🛠️ Utility Functions

### Conversion Functions

```python
def thoughts_to_dict_list(thoughts: list[Thought]) -> list[Dict[str, Any]]:
    """Convert Thought list to dictionary list"""
    return [t.to_dict() for t in thoughts]


def dict_list_to_thoughts(data: list[Dict[str, Any]]) -> list[Thought]:
    """Convert dictionary list to Thought list"""
    return [Thought.from_dict(d) for d in data]


def extract_path(thoughts: list[Thought], best_id: str) -> list[Thought]:
    """
    Extract path by backtracking from optimal thought to root

    Args:
        thoughts: List of all thoughts
        best_id: ID of optimal thought

    Returns:
        Path from root to optimal thought
    """
    thought_map = {t.id: t for t in thoughts}
    path = []

    current_id = best_id
    while current_id:
        current = thought_map[current_id]
        path.insert(0, current)  # Insert at front
        current_id = current.parent_id

    return path


def calculate_tree_statistics(thoughts: list[Thought]) -> Dict[str, Any]:
    """
    Calculate tree statistics

    Returns:
        {
            "total_nodes": 15,
            "max_depth": 3,
            "avg_depth": 1.5,
            "branching_factor": 3.0,
            "model_distribution": {"claude": 8, "codex": 7}
        }
    """
    from collections import Counter

    depths = [t.depth for t in thoughts]
    models = [t.model for t in thoughts]

    # Calculate branching factor
    depth_counts = Counter(depths)
    avg_branching = (
        sum(depth_counts.values()) / len(depth_counts)
        if depth_counts else 0
    )

    return {
        "total_nodes": len(thoughts),
        "max_depth": max(depths),
        "avg_depth": sum(depths) / len(depths),
        "branching_factor": avg_branching,
        "model_distribution": dict(Counter(models))
    }
```

### Usage Examples

```python
# Extract path
all_thoughts = [thought1, thought2, thought3, ...]
best_path = extract_path(all_thoughts, best_id="codex_3")
print([t.id for t in best_path])
# ['codex_1', 'codex_3']

# Calculate statistics
stats = calculate_tree_statistics(all_thoughts)
print(stats)
# {
#   "total_nodes": 15,
#   "max_depth": 2,
#   "avg_depth": 1.2,
#   "branching_factor": 5.0,
#   "model_distribution": {"claude": 8, "codex": 7}
# }

# Serialization/Deserialization
import json

# Save
serialized = thoughts_to_dict_list(all_thoughts)
with open("thoughts.json", "w") as f:
    json.dump(serialized, f, ensure_ascii=False, indent=2)

# Load
with open("thoughts.json", "r") as f:
    loaded = json.load(f)
thoughts_restored = dict_list_to_thoughts(loaded)
```

---

## 📊 Type Hints

### Function Signature Examples

```python
from typing import List, Dict, Tuple, Optional

def generate_thoughts(
    task: TaskConfig,
    x: str,
    current_thoughts: List[Thought],
    args: ToTArgs
) -> List[Thought]:
    """Generate thoughts"""
    ...


def evaluate_thoughts(
    task: TaskConfig,
    x: str,
    thoughts: List[Thought],
    args: ToTArgs
) -> Dict[str, Evaluation]:
    """Evaluate thoughts"""
    ...


def select_thoughts(
    thoughts: List[Thought],
    evaluations: Dict[str, Evaluation],
    k: int
) -> List[Thought]:
    """Select top k thoughts"""
    ...


def run_bfs(
    task: TaskConfig,
    x: str,
    args: ToTArgs
) -> SearchResult:
    """Execute BFS"""
    ...
```

---

## 🎯 Summary

**Standardized Data Structures:**

1. **Thought**: Individual thought (node)
   - id, text, model, depth
   - score, confidence
   - Tree structure via parent_id

2. **ToTArgs**: Execution parameters
   - Based on Princeton paper
   - Hybrid ratio adjustment
   - Optimization options

3. **TaskConfig**: Task configuration
   - Step names
   - Default parameters
   - Prompt templates

4. **Evaluation**: Evaluation result
   - Overall score + detailed scores
   - Automatic confidence calculation
   - Multiple evaluation support

5. **SearchResult**: Final result
   - Optimal thought + path
   - Statistics and metadata
   - Summary generation

**Benefits:**
- Type safety
- Consistent interface
- Serialization support
- Clear data flow

---

*ToT system standard data structure definitions*
