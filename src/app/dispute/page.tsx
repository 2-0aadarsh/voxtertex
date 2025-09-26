'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Search, Filter, Bell, FileText, X
} from 'lucide-react'
import Link from 'next/link'
import CreateDispute from './create/page'

interface Dispute {
  _id: string
  title: string
  description: string
  complainant: { firstName: string; lastName: string }
  respondent: { firstName: string; lastName: string }
  currentStage: string
  status: string
  resolution?: { compensation?: { amount: number } }
  createdAt: string
}

export default function DisputeManagement() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [stageFilter, setStageFilter] = useState('All Stages')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showModal, setShowModal] = useState(false)

  const fetchDisputes = async () => {
    try {
      const params: any = { page, limit: 20 }
      if (statusFilter !== 'All Statuses') params.status = statusFilter.toLowerCase()
      if (stageFilter !== 'All Stages') params.stage = stageFilter.toLowerCase().replace(' ', '-')

      const res = await axios.get('/api/dispute', { params })
      setDisputes(res.data.disputes)
      console.log("dispute data","res.data.dispute");
      
      setTotalPages(res.data.pagination?.pages || 1)
    } catch (err) {
      console.error('Failed to fetch disputes', err)
    }
  }

  useEffect(() => {
    fetchDisputes()
  }, [statusFilter, stageFilter, page])

  // Local search filtering
  const filtered = disputes.filter(d =>
    (d.title + d.description).toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Stats
  const active = disputes.filter(d => d.status.toLowerCase() === 'active').length
  const resolved = disputes.filter(d => d.status.toLowerCase() === 'resolved').length
  const escalated = disputes.filter(d => d.status.toLowerCase() === 'escalated').length
  const totalAmt = disputes.reduce((t, d) => t + (d.resolution?.compensation?.amount || 0), 0)

  const getStatusColor = (s: string) =>
    s.toLowerCase() === 'active' ? 'bg-blue-100 text-blue-700'
    : s.toLowerCase() === 'resolved' ? 'bg-green-100 text-green-700'
    : s.toLowerCase() === 'escalated' ? 'bg-red-100 text-red-700'
    : 'bg-gray-100 text-gray-700'

  const getStageColor = (s: string) =>
    s.toLowerCase() === 'peer-to-peer' ? 'bg-purple-100 text-purple-700'
    : s.toLowerCase() === 'mediation' ? 'bg-yellow-100 text-yellow-700'
    : s.toLowerCase() === 'legal' ? 'bg-red-100 text-red-700'
    : 'bg-gray-100 text-gray-700'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r flex flex-col justify-between h-screen">
        {/* ...Sidebar content here... */}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-end px-8 py-4 bg-white border-b">
          <button className="relative mr-6">
            <Bell size={20} className="text-gray-600 hover:text-orange-500" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-3">
            <img src="/user-avatar.png" alt="User" className="w-8 h-8 rounded-full border" />
            <span className="text-gray-700 font-medium">John Doe</span>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 p-8">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-[#FF9974] via-[#FFB194] to-[#FFCBB8] rounded-lg flex justify-between items-center p-6 mb-8">
            <div>
              <h1 className="text-xl font-bold text-black">Dispute Resolution Center</h1>
              <p className="text-white text-sm">
                Manage and resolve disputes efficiently with streamlined workflows
              </p>
            </div>
            <button onClick={() => setShowModal(true)} className="bg-[#FF6B35] text-white px-4 py-2 rounded-md font-medium">
              + File New Dispute
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <StatCard title="Active Disputes" value={active} color="text-[#FF6B35]" />
            <StatCard title="Resolved" value={resolved} color="text-[#FF8B00]" />
            <StatCard title="Escalated" value={escalated} color="text-[#FF3B30]" />
            <StatCard title="Total Amount" value={`$${totalAmt}`} color="text-[#FF6B35]" />
          </div>

          {/* Heading */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-orange-400 font-semibold">All Disputes</h2>
            <span className="px-3 py-1 text-sm text-orange-500 border border-orange-300 rounded-full">
              {filtered.length} of {disputes.length} Disputes
            </span>
          </div>

          {/* Filters + Table */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="relative flex-[2]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  className="w-full pl-9 border border-orange-200 rounded-md py-2 focus:ring-2 focus:ring-orange-300 outline-none"
                  placeholder="Search Disputes..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Stage Filter */}
              <div className="relative w-48">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                <select
                  value={stageFilter}
                  onChange={e => setStageFilter(e.target.value)}
                  className="w-full appearance-none border border-gray-200 rounded-md py-2 pl-10 pr-8 text-sm bg-white focus:ring-2 focus:ring-orange-300"
                >
                  {['All Stages', 'Peer to peer', 'Mediation', 'Legal', 'Resolved'].map(opt => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="w-48">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full appearance-none border border-gray-200 rounded-md py-2 px-3 text-sm bg-white focus:ring-2 focus:ring-orange-300"
                >
                  {['All Statuses', 'Active', 'Resolved', 'Escalated'].map(opt => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <table className="min-w-full table-auto border-separate border-spacing-0 text-left">
              <thead>
                <tr className="text-sm text-gray-700" style={{ backgroundColor: '#FFF4EB' }}>
                  <th className="px-4 py-3 font-semibold text-gray-800">Event & Reason</th>
                  <th className="px-4 py-3 font-semibold text-gray-800">Parties Involved</th>
                  <th className="px-4 py-3 font-semibold text-gray-800">Current Stage</th>
                  <th className="px-4 py-3 font-semibold text-gray-800">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-800">Amount</th>
                  <th className="px-4 py-3 font-semibold text-gray-800">Date Filed</th>
                  <th className="px-4 py-3 font-semibold text-gray-800 text-center">Manage</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d._id} className="border-b last:border-0 hover:bg-orange-50/40">
                    <td className="px-4 py-3 align-middle">
                      <div className="font-medium text-gray-900">{d.title}</div>
                      <div className="text-xs text-gray-500">{d.description}</div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex flex-wrap gap-2">
                        {[`${d.complainant.firstName} ${d.complainant.lastName}`, `${d.respondent.firstName} ${d.respondent.lastName}`].map((p, idx) => (
                          <span key={idx} className="px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-sm border border-orange-200">{p}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium ${getStageColor(d.currentStage)}`}>{d.currentStage}</span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className={`inline-flex items-center justify-center px-6 py-2 rounded-full text-sm font-medium ${getStatusColor(d.status)}`}>{d.status}</span>
                    </td>
                    <td className="px-4 py-3 align-middle">${d.resolution?.compensation?.amount || 0}</td>
                    <td className="px-4 py-3 align-middle">{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center align-middle">
                      <Link href={`/dispute/${d._id}`} className="p-2 text-gray-400 hover:text-orange-600">
                        <FileText size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end mt-4 gap-2">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`px-3 py-1 rounded-md border ${page === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-white hover:bg-orange-50 border-orange-300'}`}
            >
              Prev
            </button>
            <span className="px-3 py-1 rounded-md border bg-white">{page}</span>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded-md border ${page === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-white hover:bg-orange-50 border-orange-300'}`}
            >
              Next
            </button>
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-[#FFF4EB]/20 backdrop-blur-[1px] z-50">
              <div className="bg-white rounded-2xl shadow-lg w-full max-w-5xl h-[90vh] overflow-y-auto relative">
                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                  <X size={22} />
                </button>
                <CreateDispute onClose={() => setShowModal(false)} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ title, value, color }: { title: string; value: any; color: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-start">
      <div className="text-sm font-medium text-gray-400 mb-1">{title}</div>
      <div className={`text-3xl font-bold ${color} mb-2`}>{value}</div>
      <div className="text-xs text-gray-400">Marketing unbound</div>
      <div className="text-xs text-gray-400">October 1, 2025</div>
    </div>
  )
}
