import { useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { useJobs } from '../hooks/useJobs'
import { useCreateJob, useUpdateJob, useDeleteJob } from '../hooks/useJobs'
import Sidebar from '../components/Sidebar'
import DashboardHeader from '../components/DashboardHeader'
import JobForm from '../components/JobForm'
import JobCard from '../components/JobCard'
import SkillsPanel from '../components/SkillsPanel'
import Modal from '../components/Modal'
import styles from './Dashboard.module.css'

function Dashboard() {
  const [editingJob, setEditingJob] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const { user } = useAuth()

  // React Query - fetch jobs from backend
  const { data, isLoading } = useJobs({
    search,
    status: filter === 'All' ? undefined : filter.toLowerCase(),
  })

  const jobs = data?.jobs || []
  const createJob = useCreateJob()
  const updateJob = useUpdateJob()
  const deleteJob = useDeleteJob()
  const closeForm = () => {
    if (createJob.isPending || updateJob.isPending) return
    setShowForm(false)
    setEditingJob(null)
  }

  async function handleSubmit(job) {
    if (editingJob) {
      await updateJob.mutateAsync({ id: editingJob.id, data: job })
    } else {
      await createJob.mutateAsync(job)
    }
    setShowForm(false)
    setEditingJob(null)
  }
  console.log('Jobs query raw data:', data)

  
return (
  <div className={styles.layout}>
    <Sidebar onAddJob={() => setShowForm(true)} />

    <main className={styles.content}>

      {/* 1. Dashboard Section */}
      <section id="dashboard">
        <DashboardHeader user={user} jobs={jobs} />
      </section>

      {/* Search and Filter */}
      <div className={styles.controls}>
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option>All</option>
          <option>Applied</option>
          <option>Interview</option>
          <option>Offer</option>
        </select>
      </div>

      {/* 2. Applications Section */}
      <section id="applications">
        {isLoading ? (
          <div className={styles.loading}>
            Loading jobs...
          </div>
        ) : (
          <div className={styles.grid}>
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={setEditingJob}
                onDelete={(id) => deleteJob.mutate(id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. Skills Section */}
      <section id="skills">
        <SkillsPanel />
      </section>

    </main>

    {/* Add/Edit Job Modal */}
    {(showForm || editingJob) && (
      <Modal
        onClose={closeForm}
        isBusy={createJob.isPending || updateJob.isPending}
      >
        <JobForm
          key={editingJob?.id || 'new'}
          editingJob={editingJob}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          isSaving={createJob.isPending || updateJob.isPending}
        />
      </Modal>
    )}
  </div>
)
}

export default Dashboard

