'use client';

import { Canvas } from '@react-three/fiber';
import { ReactNode } from 'react';

interface SceneProps {
    children: ReactNode;
    className?: string;
}

export default function Scene({ children, className = '' }: SceneProps) {
    return (
        <div className={`w-full h-full ${className}`}>
            <Canvas
                camera={{
                    position: [0, 0, 5],
                    fov: 75,
                }}
                gl={{
                    antialias: true,
                    alpha: true,
                }}
                dpr={[1, 2]}
            >
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -5]} intensity={0.5} color="#0ea5e9" />
                {children}
            </Canvas>
        </div>
    );
}
