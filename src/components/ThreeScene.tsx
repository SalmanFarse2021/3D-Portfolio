'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import ProjectCard3D from './ProjectCard3D';
import { Project } from '@/types/project';

interface ThreeSceneProps {
    projects: Project[];
    onProjectClick: (project: Project) => void;
}

export default function ThreeScene({ projects, onProjectClick }: ThreeSceneProps) {
    return (
        <div className="w-full h-full absolute inset-0">
            <Canvas
                camera={{ position: [0, 0, 6], fov: 50 }}
                dpr={[1, 2]}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                <group position={[0, 0, 0]}>
                    {projects.map((project, index) => {
                        // Calculate position if not provided
                        const x = (index - (projects.length - 1) / 2) * 2;
                        const position: [number, number, number] = [x, 0, 0];

                        return (
                            <ProjectCard3D
                                key={project.id}
                                project={{ ...project, position: project.position || position }}
                                onClick={onProjectClick}
                            />
                        );
                    })}
                </group>

                <OrbitControls enableZoom={false} enablePan={true} />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
