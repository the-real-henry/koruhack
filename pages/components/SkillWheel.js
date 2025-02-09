
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

  // Initialize values at "G" (7)
  const [values, setValues] = useState(skills.map(() => 7));

  useEffect(() => {
    if (feedbackData) {
      // Calculate average ratings per skill
      const ratings = { E: 10, G: 7, S: 4, NI: 1 };
      const skillRatings = {};
      
      feedbackData.forEach(feedback => {
        const skillId = feedback.skill_id - 1; // Assuming skill_ids start at 1
        if (skillId >= 0 && skillId < skills.length) {
          if (!skillRatings[skillId]) {
            skillRatings[skillId] = [];
          }
          skillRatings[skillId].push(ratings[feedback.rating]);
        }
      });

      // Update values with averages or default to 7 (G)
      const newValues = values.map((defaultValue, index) => {
        if (skillRatings[index]) {
          const avg = skillRatings[index].reduce((a, b) => a + b, 0) / skillRatings[index].length;
          return Math.round(avg);
        }
        return defaultValue;
      });

      setValues(newValues);
    }
  }, [feedbackData]);

  // SVG dimensions and calculations
  const size = 400;
  const center = size / 2;
  const radius = size * 0.35;
  const maxValue = 10;

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
        {/* Background grid circles */}
        {[2, 4, 6, 8, 10].map((level) => (
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
  }
};

export default SkillWheel;
