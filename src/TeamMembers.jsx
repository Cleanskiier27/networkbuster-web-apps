import './TeamMembers.css'

function TeamMembers() {
  const teamMembers = [
    {
      id: 1,
      name: 'Alex Chen',
      role: 'Lead Developer',
      expertise: 'Full-Stack Development',
      avatar: '👨‍💻',
      bio: 'Expert in React, Node.js, and cloud architecture'
    },
    {
      id: 2,
      name: 'Sarah Williams',
      role: 'Product Manager',
      expertise: 'Product Strategy',
      avatar: '👩‍💼',
      bio: 'Driving innovation and user-focused design'
    },
    {
      id: 3,
      name: 'Marcus Johnson',
      role: 'DevOps Engineer',
      expertise: 'Infrastructure & Deployment',
      avatar: '👨‍🔧',
      bio: 'Ensuring scalability and reliability'
    },
    {
      id: 4,
      name: 'Emily Rodriguez',
      role: 'UI/UX Designer',
      expertise: 'Design & User Experience',
      avatar: '👩‍🎨',
      bio: 'Creating beautiful and intuitive interfaces'
    },
    {
      id: 5,
      name: 'David Kim',
      role: 'Data Scientist',
      expertise: 'ML & Analytics',
      avatar: '👨‍🔬',
      bio: 'Building intelligent systems with data'
    },
    {
      id: 6,
      name: 'Lisa Thompson',
      role: 'QA Engineer',
      expertise: 'Testing & Quality Assurance',
      avatar: '👩‍🔬',
      bio: 'Ensuring excellence through comprehensive testing'
    }
  ]

  return (
    <div className="team-page">
      <section className="team-header">
        <h1>🤝 Meet Our Team</h1>
        <p>The talented people behind NetworkBuster</p>
      </section>

      <section className="team-intro">
        <h2>Our Mission</h2>
        <p>
          We are a dedicated team of passionate professionals committed to delivering 
          cutting-edge networking solutions and innovative technology platforms. Our diverse 
          expertise spans full-stack development, cloud infrastructure, design, and data science.
        </p>
      </section>

      <section className="team-members-grid">
        {teamMembers.map((member) => (
          <div key={member.id} className="team-member-card">
            <div className="member-avatar">{member.avatar}</div>
            <div className="member-info">
              <h3>{member.name}</h3>
              <p className="member-role">{member.role}</p>
              <p className="member-expertise">{member.expertise}</p>
              <p className="member-bio">{member.bio}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="team-stats">
        <div className="stat">
          <h3>6+</h3>
          <p>Team Members</p>
        </div>
        <div className="stat">
          <h3>50+</h3>
          <p>Combined Years of Experience</p>
        </div>
        <div className="stat">
          <h3>100%</h3>
          <p>Passion for Excellence</p>
        </div>
        <div className="stat">
          <h3>∞</h3>
          <p>Innovation</p>
        </div>
      </section>
    </div>
  )
}

export default TeamMembers
