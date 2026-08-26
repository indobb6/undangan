import React, { useEffect, useState } from 'react';

export default function FloralPetals({ count = 25 }) {
  const [petals, setPetals] = useState([]);

  useEffect(() => {
    const generated = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // percentage
      size: 12 + Math.random() * 16, // px
      duration: 5 + Math.random() * 6, // s
      delay: Math.random() * 4, // s
      rotation: Math.random() * 360,
    }));
    setPetals(generated);
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="petal animate-petal-fall"
          style={{
            left: `${petal.left}%`,
            width: `${petal.size}px`,
            height: `${petal.size * 1.3}px`,
            animationDuration: `${petal.duration}s`,
            animationDelay: `${petal.delay}s`,
            transform: `rotate(${petal.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}
