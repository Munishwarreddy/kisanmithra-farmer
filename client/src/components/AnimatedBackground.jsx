import "../styles/animations.css";

const colorVariants = {
    home: {
        orb1: "from-green-400/25 to-emerald-500/25",
        orb2: "from-amber-300/20 to-yellow-400/20",
        orb3: "from-emerald-300/25 to-teal-400/25",
        shape1: "border-green-400/30", shape2: "border-emerald-400/25",
        shape3: "border-amber-400/20", shape4: "border-teal-400/25",
        dots: ["bg-green-400", "bg-emerald-400", "bg-amber-400", "bg-teal-400", "bg-lime-400", "bg-yellow-300", "bg-green-300", "bg-emerald-300", "bg-green-500", "bg-teal-300"],
    },
    farmers: {
        orb1: "from-emerald-400/25 to-teal-500/25",
        orb2: "from-lime-300/20 to-green-400/20",
        orb3: "from-teal-300/25 to-cyan-400/25",
        shape1: "border-emerald-400/30", shape2: "border-teal-400/25",
        shape3: "border-lime-400/20", shape4: "border-cyan-400/25",
        dots: ["bg-emerald-400", "bg-teal-400", "bg-lime-400", "bg-cyan-400", "bg-green-400", "bg-emerald-300", "bg-teal-300", "bg-lime-300", "bg-green-300", "bg-cyan-300"],
    },
    products: {
        orb1: "from-green-400/25 to-emerald-500/25",
        orb2: "from-orange-300/20 to-amber-400/20",
        orb3: "from-emerald-300/25 to-green-400/25",
        shape1: "border-green-400/30", shape2: "border-orange-400/25",
        shape3: "border-amber-400/20", shape4: "border-emerald-400/25",
        dots: ["bg-green-400", "bg-orange-400", "bg-amber-400", "bg-emerald-400", "bg-yellow-400", "bg-green-300", "bg-orange-300", "bg-amber-300", "bg-emerald-300", "bg-lime-400"],
    },
    about: {
        orb1: "from-teal-400/25 to-cyan-500/25",
        orb2: "from-indigo-300/20 to-blue-400/20",
        orb3: "from-cyan-300/25 to-teal-400/25",
        shape1: "border-teal-400/30", shape2: "border-cyan-400/25",
        shape3: "border-indigo-400/20", shape4: "border-blue-400/25",
        dots: ["bg-teal-400", "bg-cyan-400", "bg-indigo-400", "bg-blue-400", "bg-emerald-400", "bg-teal-300", "bg-cyan-300", "bg-green-400", "bg-blue-300", "bg-indigo-300"],
    },
    auth: {
        orb1: "from-green-400/25 to-emerald-500/25",
        orb2: "from-teal-300/20 to-emerald-400/20",
        orb3: "from-emerald-300/25 to-cyan-400/25",
        shape1: "border-green-400/30", shape2: "border-emerald-400/25",
        shape3: "border-teal-400/20", shape4: "border-cyan-400/25",
        dots: ["bg-green-400", "bg-emerald-400", "bg-teal-400", "bg-cyan-400", "bg-lime-400", "bg-green-300", "bg-emerald-300", "bg-teal-300", "bg-green-500", "bg-emerald-500"],
    },
};

// 45 small dots 3-6px spread across the full viewport
const dotConfigs = [
    { left: 3, top: 5, size: 4, delay: 0, dur: 7 }, { left: 10, top: 15, size: 3, delay: 0.8, dur: 9 },
    { left: 18, top: 8, size: 5, delay: 1.5, dur: 8 }, { left: 25, top: 22, size: 3, delay: 0.3, dur: 10 },
    { left: 32, top: 12, size: 6, delay: 2.1, dur: 7 }, { left: 40, top: 3, size: 4, delay: 1.2, dur: 11 },
    { left: 48, top: 18, size: 5, delay: 0.6, dur: 8 }, { left: 55, top: 7, size: 3, delay: 2.5, dur: 9 },
    { left: 62, top: 25, size: 5, delay: 1.8, dur: 7 }, { left: 70, top: 10, size: 4, delay: 0.4, dur: 10 },
    { left: 78, top: 20, size: 4, delay: 3.0, dur: 8 }, { left: 85, top: 5, size: 5, delay: 1.0, dur: 9 },
    { left: 92, top: 15, size: 3, delay: 2.3, dur: 11 }, { left: 5, top: 35, size: 5, delay: 0.7, dur: 8 },
    { left: 14, top: 42, size: 4, delay: 1.9, dur: 10 }, { left: 22, top: 38, size: 6, delay: 3.2, dur: 7 },
    { left: 30, top: 45, size: 4, delay: 0.2, dur: 9 }, { left: 38, top: 32, size: 3, delay: 2.7, dur: 11 },
    { left: 46, top: 40, size: 5, delay: 1.4, dur: 8 }, { left: 54, top: 35, size: 4, delay: 0.9, dur: 10 },
    { left: 62, top: 48, size: 5, delay: 3.5, dur: 7 }, { left: 70, top: 38, size: 3, delay: 2.0, dur: 9 },
    { left: 78, top: 42, size: 4, delay: 1.1, dur: 8 }, { left: 87, top: 35, size: 5, delay: 0.5, dur: 11 },
    { left: 94, top: 45, size: 3, delay: 2.8, dur: 10 }, { left: 7, top: 55, size: 5, delay: 1.6, dur: 9 },
    { left: 16, top: 62, size: 4, delay: 3.3, dur: 7 }, { left: 24, top: 58, size: 6, delay: 0.1, dur: 8 },
    { left: 33, top: 65, size: 3, delay: 2.4, dur: 10 }, { left: 42, top: 55, size: 4, delay: 1.7, dur: 11 },
    { left: 50, top: 68, size: 5, delay: 0.8, dur: 7 }, { left: 58, top: 60, size: 5, delay: 3.0, dur: 9 },
    { left: 66, top: 72, size: 3, delay: 2.2, dur: 8 }, { left: 74, top: 58, size: 5, delay: 1.3, dur: 10 },
    { left: 82, top: 65, size: 4, delay: 0.6, dur: 11 }, { left: 90, top: 55, size: 6, delay: 2.9, dur: 7 },
    { left: 4, top: 78, size: 4, delay: 1.0, dur: 9 }, { left: 15, top: 85, size: 3, delay: 3.4, dur: 8 },
    { left: 28, top: 80, size: 5, delay: 0.3, dur: 10 }, { left: 36, top: 88, size: 5, delay: 2.6, dur: 7 },
    { left: 45, top: 82, size: 3, delay: 1.5, dur: 11 }, { left: 56, top: 90, size: 4, delay: 0.9, dur: 8 },
    { left: 68, top: 85, size: 4, delay: 3.1, dur: 9 }, { left: 80, top: 78, size: 6, delay: 2.0, dur: 10 },
    { left: 91, top: 88, size: 4, delay: 1.2, dur: 7 },
];

const AnimatedBackground = ({ variant = "home" }) => {
    const colors = colorVariants[variant] || colorVariants.home;
    return (
        <div className="anim-bg-container" aria-hidden="true">
            <div className={`anim-bg-orb anim-bg-orb-1 bg-gradient-to-br ${colors.orb1}`} />
            <div className={`anim-bg-orb anim-bg-orb-2 bg-gradient-to-br ${colors.orb2}`} />
            <div className={`anim-bg-orb anim-bg-orb-3 bg-gradient-to-br ${colors.orb3}`} />
            <div className="anim-bg-shape anim-bg-cube-1"><div className={`anim-bg-cube-face ${colors.shape1}`} /></div>
            <div className="anim-bg-shape anim-bg-diamond-1"><div className={`anim-bg-diamond-face ${colors.shape2}`} /></div>
            <div className="anim-bg-shape anim-bg-ring-1"><div className={`anim-bg-ring-face ${colors.shape3}`} /></div>
            <div className="anim-bg-shape anim-bg-cube-2"><div className={`anim-bg-cube-face ${colors.shape4}`} /></div>
            {dotConfigs.map((dot, i) => (
                <div key={i} className={`anim-bg-dot ${colors.dots[i % colors.dots.length]}`}
                    style={{ left: `${dot.left}%`, top: `${dot.top}%`, width: `${dot.size}px`, height: `${dot.size}px`, animationDelay: `${dot.delay}s`, animationDuration: `${dot.dur}s` }}
                />
            ))}
        </div>
    );
};

export default AnimatedBackground;
