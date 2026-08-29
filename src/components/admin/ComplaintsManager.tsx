import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ShieldAlert, CheckCircle, AlertTriangle, Phone, ThumbsDown, Wrench, IndianRupee, RefreshCw, MessageSquare } from 'lucide-react';
import { ComplaintRecord } from '../../types';

interface ComplaintsManagerProps {
  complaints: ComplaintRecord[];
  onComplaintUpdated: () => void;
  showNotification: (msg: string) => void;
}

export default function ComplaintsManager({
  complaints,
  onComplaintUpdated,
  showNotification
}: ComplaintsManagerProps) {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [callingPerson, setCallingPerson] = useState<{ role: string; name: string; phone: string } | null>(null);

  const filteredComplaints = complaints.filter(c => {
    if (filterStatus === 'ALL') return true;
    return c.status === filterStatus;
  });

  const handleResolveComplaint = async (complaintId: string) => {
    try {
      await updateDoc(doc(db, 'complaints', complaintId), {
        status: 'RESOLVED',
        resolvedAt: new Date().toISOString()
      });

      try {
        const stored = JSON.parse(localStorage.getItem('punchx_complaints') || '[]');
        const updated = stored.map((c: any) => c.id === complaintId ? { ...c, status: 'RESOLVED' } : c);
        localStorage.setItem('punchx_complaints', JSON.stringify(updated));
      } catch (err) {
        console.warn(err);
      }

      showNotification(`✓ Incident ${complaintId} marked resolved.`);
      onComplaintUpdated();
    } catch (err: any) {
      showNotification("Error resolving complaint: " + err?.message);
    }
  };

  return (
    <div className="space-y-5 text-left font-sans">
      {/* Header */}
      <div className="bg-[#11192e] border border-rose-500/40 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              Arrival Quality Escalations & Complaints
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono">
                {complaints.filter(c => c.status !== 'RESOLVED').length} CRITICAL
              </span>
            </h2>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Live alerts when technicians arrive with improper tools, faulty equipment, or poor conduct. Automatic 10% discount is applied.
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          {['ALL', 'CRITICAL_PENDING_ADMIN', 'RESOLVED'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all ${
                filterStatus === st
                  ? 'bg-rose-500 text-white shadow'
                  : 'bg-[#07122a] border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {st === 'CRITICAL_PENDING_ADMIN' ? 'Critical Pending' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredComplaints.length > 0 ? (
          filteredComplaints.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-[#11192e] border border-rose-500/30 hover:border-rose-500/70 rounded-2xl p-5 shadow-lg space-y-3.5 flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono font-extrabold text-rose-400">{complaint.id}</span>
                    <span className="text-[10px] text-zinc-400 block font-mono">Order: {complaint.orderId}</span>
                  </div>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                    complaint.status === 'RESOLVED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                  }`}>
                    {complaint.status === 'CRITICAL_PENDING_ADMIN' ? 'CRITICAL ESCALATION' : complaint.status}
                  </span>
                </div>

                {/* Worker and Customer Info */}
                <div className="bg-[#07122a] border border-zinc-800/80 rounded-xl p-3 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-mono block">Technician:</span>
                      <strong className="text-white">{complaint.workerName}</strong>
                      <span className="text-[10px] text-zinc-400 block">({complaint.workerCategory || 'Specialist'})</span>
                    </div>
                    <button
                      onClick={() => setCallingPerson({ role: 'Technician', name: complaint.workerName, phone: complaint.workerPhone || '+91 98765 43210' })}
                      className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-[#e9c176] rounded-lg text-[10px] font-bold font-mono flex items-center gap-1 cursor-pointer"
                    >
                      <Phone className="w-3 h-3" /> Call Worker
                    </button>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-mono block">Customer:</span>
                      <strong className="text-white">{complaint.customerName}</strong>
                      <span className="text-[10px] text-zinc-400 block truncate max-w-[130px]">{complaint.customerAddress}</span>
                    </div>
                    <button
                      onClick={() => setCallingPerson({ role: 'Customer', name: complaint.customerName, phone: complaint.customerPhone || '+91 98765 43210' })}
                      className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 rounded-lg text-[10px] font-bold font-mono flex items-center gap-1 cursor-pointer"
                    >
                      <Phone className="w-3 h-3" /> Call Customer
                    </button>
                  </div>
                </div>

                {/* Issue Checklist Breakdown */}
                <div className="bg-[#0e162a] border border-zinc-800 rounded-xl p-2.5 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-[11px]">Correct Equipment:</span>
                    <span className={complaint.correctEquipment ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                      {complaint.correctEquipment ? '✓ Complete' : '✗ Missing Tools'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-[11px]">Equipment Condition:</span>
                    <span className={complaint.equipmentWorking ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                      {complaint.equipmentWorking ? '✓ Working' : '✗ Broken / Inadequate'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-[11px]">Technician Conduct:</span>
                    <span className="text-amber-400 font-bold">{complaint.behaviourRating}</span>
                  </div>
                </div>

                {/* Customer Remark */}
                {complaint.comment && (
                  <p className="text-xs text-zinc-300 bg-[#07122a]/60 p-2.5 rounded-xl border border-zinc-800/60 leading-relaxed italic">
                    "{complaint.comment}"
                  </p>
                )}

                {/* Compensation status */}
                <div className="bg-rose-950/30 border border-rose-800/40 rounded-xl p-2.5 text-xs flex justify-between items-center font-mono">
                  <div>
                    <span className="text-zinc-400 block text-[9px]">10% DISCOUNT PROCESSED</span>
                    <span className="text-emerald-400 font-extrabold">₹{complaint.discountAmount}</span>
                  </div>
                  <span className="text-[9.5px] text-zinc-300">
                    {complaint.refundType === 'CASH_DISCOUNT' || complaint.refundType === 'COD_DISCOUNT' ? 'Cash Deducted' : 'Prepaid Refund Queued'}
                  </span>
                </div>
              </div>

              {/* Action */}
              {complaint.status === 'CRITICAL_PENDING_ADMIN' && (
                <div className="pt-2 border-t border-zinc-800">
                  <button
                    onClick={() => handleResolveComplaint(complaint.id)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" /> Resolve & Issue Warning
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-[#11192e] border border-zinc-800 rounded-3xl p-6 space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-zinc-300">No Quality Complaints</p>
            <p className="text-xs text-zinc-500">
              All active field technicians have satisfied arrival equipment and behavior checks.
            </p>
          </div>
        )}
      </div>

      {/* Simulated Call Modal */}
      <AnimatePresence>
        {callingPerson && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#11192e] border border-[#c5a059]/40 w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#e9c176] mx-auto animate-pulse">
                <Phone className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#c5a059] uppercase font-bold block">Dialing {callingPerson.role}</span>
                <h3 className="text-lg font-extrabold text-white">{callingPerson.name}</h3>
                <p className="text-xs font-mono text-zinc-400 mt-0.5">{callingPerson.phone}</p>
              </div>
              <p className="text-xs text-zinc-300 bg-[#07122a] p-3 rounded-xl border border-zinc-800">
                Connected via secure VoIP dispatcher line. Explain service compliance standards and resolve customer issue.
              </p>
              <button
                onClick={() => setCallingPerson(null)}
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                End Call
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
