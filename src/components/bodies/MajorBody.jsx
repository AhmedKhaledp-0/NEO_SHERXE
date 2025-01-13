import React, { useRef } from 'react';
import { Instance } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { calculatePosition } from '../../utilities/orbitalMechanics';

export function MajorBody({ body, time }) {
  const ref = useRef();
  
  useFrame(() => {
    if (!ref.current) return;
    const position = calculatePosition(body, time);
    ref.current.position.set(position.x, position.y, position.z);
  });

  return <Instance ref={ref} />;
}
