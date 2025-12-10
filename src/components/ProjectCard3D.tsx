'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Project } from '@/types/project';

interface ProjectCard3DProps {
    project: Project;
    onClick: (project: Project) => void;
}

export default function ProjectCard3D({ project, onClick }: ProjectCard3DProps) {
    const meshRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);

    // Smooth hover animation
    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Scale up on hover
        const targetScale = hovered ? 1.15 : 1;
        meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 10);
    });

    return (
        <Float
            speed={2}
            rotationIntensity={0.2}
            floatIntensity={0.5}
            floatingRange={[-0.1, 0.1]}
        >
            <group
                ref={meshRef}
                position={project.position || [0, 0, 0]}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick(project);
                }}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    document.body.style.cursor = 'pointer';
                    setHovered(true);
                }}
                onPointerOut={(e) => {
                    e.stopPropagation();
                    document.body.style.cursor = 'auto';
                    setHovered(false);
                }}
            >
                {/* Card Background */}
                <mesh>
                    <boxGeometry args={[2.2, 3, 0.1]} />
                    <meshStandardMaterial
                        color={hovered ? "#1e293b" : "#0f172a"}
                        roughness={0.3}
                        metalness={0.8}
                        emissive={hovered ? "#0ea5e9" : "#000000"}
                        emissiveIntensity={hovered ? 0.2 : 0}
                    />
                </mesh>

                {/* Border/Edge Highlight */}
                <mesh position={[0, 0, -0.01]}>
                    <boxGeometry args={[2.25, 3.05, 0.08]} />
                    <meshStandardMaterial color={hovered ? "#38bdf8" : "#334155"} />
                </mesh>

                {/* 3D Text Content */}
                <group position={[0, 0, 0.06]}>
                    {/* Title */}
                    <Text
                        position={[0, 0.8, 0]}
                        fontSize={0.2}
                        color="white"
                        anchorX="center"
                        anchorY="top"
                        maxWidth={1.8}
                        textAlign="center"
                        font="/fonts/Inter-Bold.woff" // Assuming standard font or default
                    >
                        {project.title}
                    </Text>

                    {/* Description (Summary) */}
                    <Text
                        position={[0, 0.2, 0]}
                        fontSize={0.12}
                        color="#94a3b8"
                        anchorX="center"
                        anchorY="top"
                        maxWidth={1.8}
                        textAlign="center"
                        lineHeight={1.4}
                    >
                        {project.description.length > 80
                            ? project.description.substring(0, 80) + '...'
                            : project.description}
                    </Text>

                    {/* Tech Stack Tags (Visual representation) */}
                    <group position={[0, -0.8, 0]}>
                        {project.technologies.slice(0, 3).map((tech, i) => (
                            <Text
                                key={tech}
                                position={[(i - 1) * 0.6, 0, 0]}
                                fontSize={0.08}
                                color="#38bdf8"
                                anchorX="center"
                                anchorY="middle"
                            >
                                {tech}
                            </Text>
                        ))}
                    </group>
                </group>

                {/* HTML Overlay for Tooltip/CTA */}
                {hovered && (
                    <Html position={[0, -1.8, 0]} center transform>
                        <div className="bg-primary-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap border border-primary-400">
                            Click to View Details
                        </div>
                    </Html>
                )}
            </group>
        </Float>
    );
}
