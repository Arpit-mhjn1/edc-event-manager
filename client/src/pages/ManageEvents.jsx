import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Plus, Edit2, Trash2, Users, Download, X } from 'lucide-react';

const ManageEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    capacity: '',
    start_time: '',
    end_time: '',
    status: 'PUBLISHED',
    committee_id: 1, // Default for now
    is_paid: false,
    fee_amount: '',
    bank_details: ''
  });

  const fetchAdminEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events');
      setEvents(res.data?.data?.events || []);
    } catch (error) {
      console.error("Failed to fetch events", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminEvents();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event? This will also delete all registrations associated with it.")) {
      try {
        await api.delete(`/events/${id}`);
        fetchAdminEvents(); // Refresh list
      } catch (error) {
        alert("Failed to delete event.");
      }
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEventId) {
        await api.put(`/events/${editingEventId}`, formData);
      } else {
        await api.post('/events', formData);
      }
      setIsModalOpen(false);
      setEditingEventId(null);
      setFormData({
        title: '', description: '', venue: '', capacity: '', start_time: '', end_time: '', status: 'PUBLISHED', committee_id: 1, is_paid: false, fee_amount: '', bank_details: ''
      });
      fetchAdminEvents(); // Refresh list
    } catch (error) {
      alert(`Failed to ${editingEventId ? 'update' : 'create'} event. Make sure all fields are valid.`);
    }
  };

  const handleEditClick = (event) => {
    setEditingEventId(event.id);
    // Format dates for datetime-local input
    const formatDate = (isoString) => {
      if (!isoString) return '';
      const date = new Date(isoString);
      return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    setFormData({
      title: event.title || '',
      description: event.description || '',
      venue: event.venue || '',
      capacity: event.capacity || '',
      start_time: formatDate(event.start_time),
      end_time: formatDate(event.end_time),
      status: event.status || 'PUBLISHED',
      committee_id: event.committee_id || 1,
      is_paid: event.is_paid || false,
      fee_amount: event.fee_amount || '',
      bank_details: event.bank_details || ''
    });
    setIsModalOpen(true);
  };

  const handleExport = async (eventId, eventTitle) => {
    try {
      const res = await api.get(`/events/${eventId}/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${eventTitle}_Registrations.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Failed to export registrations.");
    }
  };

  const handleGenerateCertificates = async (eventId) => {
    try {
      if (window.confirm("Are you sure you want to generate certificates for all approved registrations? This cannot be undone.")) {
        const res = await api.post(`/events/${eventId}/certificates/generate`);
        alert(res.data.message || 'Certificates generated successfully!');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to generate certificates. Maybe they are already generated or no approved students exist.');
    }
  };

  if (user?.role !== 'COMMITTEE_HEAD' && user?.role !== 'SUPER_ADMIN') {
    return <div className="p-8 text-red-500 font-bold">Unauthorized. Committee access required.</div>;
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Events</h2>
          <p className="text-gray-500 mt-1">Create, edit, and track registrations for your events.</p>
        </div>
        <button 
          onClick={() => {
            setEditingEventId(null);
            setFormData({ title: '', description: '', venue: '', capacity: '', start_time: '', end_time: '', status: 'PUBLISHED', committee_id: 1, is_paid: false, fee_amount: '', bank_details: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus size={20} className="mr-2" />
          Create New Event
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Event Name</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Registrations</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-semibold text-gray-900">{event.title}</p>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {new Date(event.start_time).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      event.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center text-sm font-medium text-gray-700">
                      <Users size={16} className="mr-2 text-primary-500" />
                      {event.registrations_count || 0} / {event.capacity}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${Math.min(((event.registrations_count || 0) / event.capacity) * 100, 100)}%` }}></div>
                    </div>
                  </td>
                  <td className="py-4 px-6 flex justify-end space-x-3">
                    <button onClick={() => handleGenerateCertificates(event.id)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Generate Certificates">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M12 18v-6"></path><path d="M9 15l3-3 3 3"></path></svg>
                    </button>
                    <button onClick={() => handleExport(event.id, event.title)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Download Excel List">
                      <Download size={18} />
                    </button>
                    <button onClick={() => handleEditClick(event)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit Event">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(event.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Event">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {events.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-500">
                No events found. Click "Create New Event" to get started.
            </div>
        )}
      </div>

      {/* Create Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-white md:rounded-2xl shadow-xl w-full h-full md:h-auto max-w-2xl overflow-hidden md:max-h-[90vh] flex flex-col">
            <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold text-gray-900">{editingEventId ? 'Edit Event' : 'Create New Event'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="p-4 md:p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input type="text" required className="w-full p-2 border border-gray-200 rounded-lg" 
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required className="w-full p-2 border border-gray-200 rounded-lg" rows="3"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                  <input type="text" required className="w-full p-2 border border-gray-200 rounded-lg" 
                    value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input type="number" required className="w-full p-2 border border-gray-200 rounded-lg" 
                    value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input type="datetime-local" required className="w-full p-2 border border-gray-200 rounded-lg" 
                    value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input type="datetime-local" required className="w-full p-2 border border-gray-200 rounded-lg" 
                    value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
                </div>
              </div>

              {/* Payment Details Section */}
              <div className="border-t border-gray-100 pt-4 mt-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-900 mb-3 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4"
                    checked={formData.is_paid} onChange={e => setFormData({...formData, is_paid: e.target.checked})} />
                  <span>Is this a Paid Event?</span>
                </label>

                {formData.is_paid && (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Price (₹)</label>
                      <input type="number" required={formData.is_paid} className="w-full p-2 border border-gray-200 rounded-lg" 
                        value={formData.fee_amount} onChange={e => setFormData({...formData, fee_amount: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Instructions (UPI ID / Bank Details)</label>
                      <textarea required={formData.is_paid} className="w-full p-2 border border-gray-200 rounded-lg text-sm" rows="2"
                        placeholder="e.g., Pay to 9876543210@paytm or AC: 123456789 IFSC: HDFC0001"
                        value={formData.bank_details} onChange={e => setFormData({...formData, bank_details: e.target.value})}></textarea>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">
                  {editingEventId ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageEvents;
