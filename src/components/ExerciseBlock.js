import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './ExerciseBlock.module.css';

// A reusable component for displaying exercises with collapsible solutions
function ExerciseBlock({ title, children, solution }) {
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className={clsx('exercise-block', styles.exerciseBlock)}>
      <div className="exercise-title">
        <h3>{title}</h3>
      </div>
      <div className={styles.exerciseContent}>
        {children}
      </div>
      <div className={styles.solutionSection}>
        <button
          className={clsx('button button--secondary button--sm', styles.solutionButton)}
          onClick={() => setShowSolution(!showSolution)}
        >
          {showSolution ? 'Hide Solution' : 'Show Solution'}
        </button>
        {showSolution && (
          <div className={clsx('solution-content', styles.solutionContent)}>
            <h4>Solution:</h4>
            <div>{solution}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExerciseBlock;