
import React, { useState, useEffect } from 'react';

const SkillWheel = ({ studentId, feedbackData }) => {
  const skills = [
    'Collaboration',
    'Organization', 
    'Independence',
    'Communication',
    'Leadership',
    'Creativity'
  ];

  // Initialize values at 3 points per skill
  const [values, setValues] = useState(skills.map(() => 3));

  useEffect(() => {
    if (feedbackData) {
      // Calculate points per skill
      const points = {
        E: 0.5,  // Excellent adds 0.5 points
        G: 0.2,  // Good adds 0.2 points
        S: -0.2, // Satisfactory subtracts 0.2 points
        NI: -0.5 // Needs Improvement subtracts 0.5 points
      };
      
      // Start with base points (3) for each skill
      const skillPoints = skills.map(() => 3);
      
      // Process each feedback and adjust points
      feedbackData.forEach(feedback => {
        const skillId = feedback.skill_id - 1; // Assuming skill_ids start at 1
        if (skillId >= 0 && skillId < skills.length) {
          skillPoints[skillId] += points[feedback.rating];
          // Cap points between 1 and 5
          skillPoints[skillId] = Math.max(1, Math.min(5, skillPoints[skillId]));
        }
      });

      setValues(skillPoints);
    }
  }, [feedbackData]);

  // SVG dimensions and calculations
  const size = 400;
  const center = size / 2;
  const radius = size * 0.35;
  const maxValue = 5; // Max points is 5

  const getPoints = () => {
    return values.map((value, i) => {
      const angle = (i * 2 * Math.PI) / skills.length - Math.PI / 2;
      const distance = (value / maxValue) * radius;
      return `${center + distance * Math.cos(angle)},${center + distance * Math.sin(angle)}`;
    }).join(' ');
  };

  const getGridCircle = (level) => {
    const points = [];
    for (let i = 0; i < 360; i += 1) {
      const angle = (i * Math.PI) / 180;
      const distance = (level / maxValue) * radius;
      points.push(`${center + distance * Math.cos(angle)},${center + distance * Math.sin(angle)}`);
    }
    return points.join(' ');
  };

  return (
    <div style={styles.wheelContainer}>
      <svg viewBox={`0 0 ${size} ${size}`} style={styles.svg}>
        {/* Background grid circles - now showing point levels */}
        {[1, 2, 3, 4, 5].map((level) => (
          <polyline
            key={level}
            points={getGridCircle(level)}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
            style={styles.gridLine}
          />
        ))}

        {/* Axis lines */}
        {skills.map((_, i) => {
          const angle = (i * 2 * Math.PI) / skills.length - Math.PI / 2;
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={center + radius * Math.cos(angle)}
              y2={center + radius * Math.sin(angle)}
              stroke="#e5e7eb"
              strokeWidth="1"
              style={styles.gridLine}
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={getPoints()}
          fill="rgb(59, 130, 246)"
          fillOpacity="0.5"
          stroke="rgb(37, 99, 235)"
          strokeWidth="2"
        />

        {/* Skill labels */}
        {skills.map((skill, i) => {
          const angle = (i * 2 * Math.PI) / skills.length - Math.PI / 2;
          const labelDistance = radius + 30;
          return (
            <text
              key={i}
              x={center + labelDistance * Math.cos(angle)}
              y={center + labelDistance * Math.sin(angle)}
              textAnchor="middle"
              dominantBaseline="middle"
              style={styles.skillLabel}
            >
              {skill}
            </text>
          );
        })}
      </svg>
      
      {/* Point values display */}
      <div style={styles.pointsDisplay}>
        {skills.map((skill, i) => (
          <div key={i} style={styles.pointRow}>
            <span>{skill}:</span>
            <span>{values[i].toFixed(1)} points</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  wheelContainer: {
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
    padding: '1rem'
  },
  svg: {
    width: '100%',
    height: 'auto'
  },
  gridLine: {
    opacity: 0.5
  },
  skillLabel: {
    fontSize: '14px',
    fontWeight: 500
  },
  pointsDisplay: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  pointRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.25rem 0'
  }
};

export default SkillWheel;
