const AuthMascotOrbit = ({ image, title, subtitle, icons = ["📚", "🧠", "⏱️", "🌱", "✨"] }) => {
  return (
    <div className="auth-orbit-panel">
      <div className="auth-character-orbit">
        <div className="auth-glow auth-glow-1"></div>
        <div className="auth-glow auth-glow-2"></div>

        <div className="auth-orbit-ring auth-orbit-ring-1"></div>
        <div className="auth-orbit-ring auth-orbit-ring-2"></div>
        <div className="auth-orbit-ring auth-orbit-ring-3"></div>

        {icons.map((icon, index) => (
          <div key={index} className={`auth-orbit-icon auth-orbit-icon-${index + 1}`}>
            {icon}
          </div>
        ))}

        <img
          src={image}
          alt={title}
          className="auth-character-image"
        />
      </div>

      <div className="relative z-10 text-center mt-6">
        <h2 className="text-3xl font-black text-white">{title}</h2>
        <p className="mt-2 text-white/80 font-semibold">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthMascotOrbit;
