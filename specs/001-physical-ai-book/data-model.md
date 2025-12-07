# Data Model: Physical AI & Humanoid Robotics Book

## Core Entities

### Module
- **name**: string (e.g., "ROS 2 Robotic Nervous System")
- **description**: string (brief overview of the module content)
- **sections**: array of Section entities
- **prerequisites**: array of string (knowledge required before starting)
- **learning_objectives**: array of string (what user will learn)
- **duration**: number (estimated time in minutes)

### Section
- **title**: string (e.g., "Introduction to ROS 2")
- **content**: string (markdown content)
- **type**: enum ("theory", "example", "exercise")
- **difficulty**: enum ("beginner", "intermediate", "advanced")
- **estimated_time**: number (time to complete in minutes)

### Exercise
- **title**: string (exercise name)
- **description**: string (what the user needs to do)
- **difficulty**: enum ("beginner", "intermediate", "advanced")
- **solution**: string (text-based solution)
- **hints**: array of string (helpful tips)
- **validation_criteria**: array of string (how to verify completion)

### CodeExample
- **title**: string (example title)
- **language**: string (programming language for syntax highlighting)
- **code**: string (the actual code content)
- **explanation**: string (what the code demonstrates)
- **related_concepts**: array of string (theories this example relates to)

### UserProgress
- **module_id**: string (identifier for the module)
- **completed_sections**: array of string (IDs of completed sections)
- **completed_exercises**: array of string (IDs of completed exercises)
- **last_accessed**: date (when the user last accessed this module)
- **completion_percentage**: number (0-100)

## Relationships

- Module **contains** many Sections
- Module **contains** many Exercises
- Module **contains** many CodeExamples
- Section **may reference** many CodeExamples
- Exercise **may reference** many CodeExamples

## Validation Rules

1. **Module**:
   - Name must be 3-100 characters
   - Must contain at least 3 sections
   - Must include at least 1 exercise
   - Learning objectives must be specific and measurable

2. **Section**:
   - Title must be 5-100 characters
   - Content must be at least 100 words for theory sections
   - Type must be one of the defined enum values

3. **Exercise**:
   - Difficulty must match the module's target audience
   - Solution must be provided
   - Must have clear validation criteria

4. **CodeExample**:
   - Code must be non-executable text (satisfying static content requirement)
   - Must have a clear explanation of its purpose
   - Language must be properly specified for syntax highlighting

## State Transitions

- Module: draft → review → published
- Section: not_started → in_progress → completed
- Exercise: not_attempted → in_progress → completed → verified