import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Grid } from '@react-three/drei';
import { useRef } from 'react';

function RotatingGrid() {
    const gridRef = useRef();
    useFrame((state, delta) => {
        if (gridRef.current) {
            gridRef.current.rotation.y += delta * 0.05;
        }
    });
    return (
        <group ref={gridRef} rotation={[-Math.PI / 4, 0, 0]}> {/* Angled grid for impact */}
            <Grid
                args={[100, 100]}
                cellSize={1}
                cellThickness={0.5}
                cellColor="#00f0ff"
                sectionSize={5}
                sectionThickness={1}
                sectionColor="#ff003c"
                fadeDistance={50}
            />
        </group>
    );
}

function FloatingCube() {
    const meshRef = useRef();
    useFrame((state, delta) => {
        meshRef.current.rotation.x += delta * 0.2;
        meshRef.current.rotation.y += delta * 0.2;
    });

    return (
        <mesh ref={meshRef} position={[0, 2, 0]}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial wireframe color="white" />
        </mesh>
    );
}


export default function AvatarWorld() {
    return (
        <div className="absolute inset-0 -z-10">
            <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
                <fog attach="fog" args={['#050505', 10, 60]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00f0ff" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#ff003c" />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <RotatingGrid />
                <FloatingCube />

                <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={false} />
            </Canvas>
        </div>
    );
}
