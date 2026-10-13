export function adaptJobFromApi(job) {
  return {
    id: job._id,
    title: job.title,
    company: job.company,
    status: job.status, // stays lowercase
    dateApplied: job.dateApplied ? job.dateApplied.slice(0, 10) : '',
    datePosted: job.datePosted ? job.datePosted.slice(0, 10) : '',
    deadline: job.deadline ? job.deadline.slice(0, 10) : '',
    platform: job.platform || '',
    jobLink: job.jobLink || '',
    notes: job.notes || '',
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  }
}
