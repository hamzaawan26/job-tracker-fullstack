import styles from './SkillsPanel.module.css'

export default function SkillsPanel() {
  const skills = [
    { name: 'React', level: 75 },
    { name: 'DSA', level: 55 },
    { name: 'System Design', level: 40 },
  ]

  return (
    <div className={styles.panel}>
      <h3>Skill Readiness</h3>

      {skills.map((skill) => (
        <div key={skill.name} className={styles.skill}>
          <span>{skill.name}</span>
          <progress value={skill.level} max="100" />
        </div>
      ))}

      <p className={styles.tip}>
        Focus on skills below 60% to improve interview success.
      </p>
    </div>
  )
}
