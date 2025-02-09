
import React, { useState, useEffect } from 'react';

const SkillWheel = ({ studentId, feedbackData }) => {
  // Map skill_ids to their respective names (matching database)
  const skillMap = {
    1: 'Collaboration',
    2: 'Organization', 
    3: 'Independence',
    4: 'Communication',
    5: 'Leadership',
    6: 'Creativity'
  };

  const skills = Object.values(skillMap);
  const [values, setValues] = useState(skills.map(() => 3));

  useEffect(() => {
    if (feedbackData) {
      const points = {
        E: 0.5,
        G: 0.2,
        S: -0.2,
        NI: -0.5
      };
      
      // Start with base points
      const skillPoints = skills.map(() => 3);
      
      // Process feedback using proper skill mapping
      feedbackData.forEach(feedback => {
        const skillIndex = Object.keys(skillMap).indexOf(feedback.skill_id.toString());
        if (skillIndex !== -1) {
          skillPoints[skillIndex] += points[feedback.rating];
          skillPoints[skillIndex] = Math.max(1, Math.min(5, skillPoints[skillIndex]));
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
