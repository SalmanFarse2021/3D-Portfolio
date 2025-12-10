'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function ParticleField() {
    const pointsRef = useRef<THREE.Points>(null);

    // Generate random particle positions
    const particleCount = 2000;
    const positions = useMemo(() => {
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 20;
            positions[i3 + 1] = (Math.random() - 0.5) * 20;
            positions[i3 + 2] = (Math.random() - 0.5) * 20;
        }

        return positions;
    }, []);

    useFrame((state) => {
        if (!pointsRef.current) return;

        const time = state.clock.getElapsedTime();

        // Rotate the entire particle field
        pointsRef.current.rotation.y = time * 0.05;
        pointsRef.current.rotation.x = time * 0.03;
    });

    return (
        <Points
            ref={pointsRef}
            positions={positions}
            stride={3}
            frustumCulled={false}
        >
            <PointMaterial
                transparent
                color="#0ea5e9"
                size={0.05}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.6}
            />
        </Points>
    );
}
