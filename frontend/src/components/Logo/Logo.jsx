import React from 'react';

const Logo = ({ className }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 150" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 1. ВУШКА КОТИКА (Верхній лівий кут літери S) */}
      {/* Трикутник, що дивиться вгору */}
      <polygon points="30,25 40,0 50,25" />
      {/* Трикутник, що дивиться вліво */}
      <polygon points="30,25 5,35 30,45" />
      
      {/* 2. ЛІТЕРА "S" (Масивна основа) */}
      <text 
        x="50" 
        y="90" 
        fontFamily="sans-serif" 
        fontWeight="900" 
        fontSize="100" 
        textAnchor="middle"
      >
        S
      </text>
      
      {/* 3. ЛІТЕРА "F" (Ніжка виростає з S) */}
      {/* Вертикальна лінія */}
      <rect x="40" y="80" width="20" height="40" />
      {/* Горизонтальна риска праворуч */}
      <rect x="60" y="95" width="25" height="16" />
      
      {/* 4. НОСИК КОТИКА (Самий низ, перевернутий трикутник) */}
      <polygon points="38,125 62,125 50,137" />
      
      {/* КРИХІТНИЙ РОМБ / ЗІРОЧКА (Під носиком) */}
      <polygon points="50,139 55,143 50,147 45,143" />
    </svg>
  );
};

export default Logo;
