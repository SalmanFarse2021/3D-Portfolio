'use client';

import { useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function CameraController() {
    const { camera } = useThree();

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const maxScroll = 1000;
            const scrollProgress = Math.min(scrollY / maxScroll, 1);

            // Move camera based on scroll
            camera.position.z = 5 - scrollProgress * 2;
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [camera]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // Subtle camera movement
        camera.position.x = Math.sin(time * 0.1) * 0.5;
        camera.position.y = Math.cos(time * 0.15) * 0.3;

        camera.lookAt(new THREE.Vector3(0, 0, 0));
    });

    return null;
}
