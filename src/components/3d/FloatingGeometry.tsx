'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { MeshDistortMaterial } from '@react-three/drei';

interface FloatingGeometryProps {
    position: [number, number, number];
    type?: 'sphere' | 'torus' | 'box';
    color?: string;
}

export default function FloatingGeometry({
    position,
    type = 'sphere',
    color = '#0ea5e9',
}: FloatingGeometryProps) {
    const meshRef = useRef<Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;

        const time = state.clock.getElapsedTime();

        // Rotation animation
        meshRef.current.rotation.x = time * 0.3;
        meshRef.current.rotation.y = time * 0.2;

        // Floating animation
        meshRef.current.position.y = position[1] + Math.sin(time + position[0]) * 0.3;
    });

    const renderGeometry = () => {
        switch (type) {
            case 'torus':
                return <torusGeometry args={[0.7, 0.3, 16, 100]} />;
            case 'box':
                return <boxGeometry args={[1, 1, 1]} />;
            case 'sphere':
            default:
                return <sphereGeometry args={[1, 32, 32]} />;
        }
    };

    return (
        <mesh ref={meshRef} position={position}>
            {renderGeometry()}
            <MeshDistortMaterial
                color={color}
                attach="material"
                distort={0.3}
                speed={2}
                roughness={0.2}
                metalness={0.8}
            />
        </mesh>
    );
}
