import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Calendar as CalendarIcon, MapPin, Users, ArrowRight, X, CreditCard } from 'lucide-react';

const EventListing = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Payment Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fallback mock data if backend isn't populated
        const res = await api.get('/events').catch(() => ({ data: { data: { events: [] } } }));
        let fetchedEvents = res.data?.data?.events || [];
        
        if (fetchedEvents.length === 0) {
            // Mock data for UI demonstration
            fetchedEvents = [
                {
                    id: 1,
                    title: "AI & Web3 Hackathon 2024",
                    description: "Join the largest hackathon of the year and build the future.",
                    committee_name: "Entrepreneurship Development Cell",
                    start_time: new Date(Date.now() + 86400000 * 3).toISOString(),
                    venue: "Main Auditorium",
                    capacity: 500,
                    banner_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    is_paid: false
                },
                {
                    id: 2,
                    title: "Startup Pitch Deck Workshop",
                    description: "Learn how to craft the perfect pitch deck for investors.",
                    committee_name: "Entrepreneurship Development Cell",
                    start_time: new Date(Date.now() + 86400000 * 7).toISOString(),
                    venue: "Seminar Hall B",
                    capacity: 100,
                    banner_url: "https://images.unsplash.com/photo-1556761175-5973dc0f32d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    is_paid: true,
                    fee_amount: 500
                }
            ];
        }
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Upcoming Events</h2>
          <p className="text-gray-500 mt-1">Discover and register for the latest workshops and hackathons.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col">
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              <img 
                src={event.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                alt={event.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-4 left-4 z-20">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-xs font-medium text-white shadow-sm">
                  {event.committee_name}
                </span>
              </div>
              {event.is_paid && (
                 <div className="absolute top-4 right-4 z-20">
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-xs font-bold text-white shadow-md">
                        ₹{event.fee_amount}
                    </span>
                 </div>
              )}
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                {event.title}
              </h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">
                {event.description}
              </p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarIcon size={16} className="mr-2 text-primary-500" />
                  {new Date(event.start_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={16} className="mr-2 text-primary-500" />
                  {event.venue}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users size={16} className="mr-2 text-primary-500" />
                  Capacity: {event.capacity}
                </div>
              </div>
              
              <button 
                onClick={async () => {
                  if (event.is_paid) {
                    setSelectedEvent(event);
                    setTransactionId('');
                  } else {
                    try {
                      await api.post('/registrations', { event_id: event.id });
                      alert('Successfully registered for the event!');
                    } catch (error) {
                      alert(error.response?.data?.message || 'Failed to register.');
                    }
                  }
                }}
                className="w-full py-3 px-4 bg-gray-50 hover:bg-primary-50 text-primary-700 font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center group/btn"
              >
                Register Now
                <ArrowRight size={18} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Complete Payment</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedEvent.title}</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-indigo-50 rounded-xl p-4 flex items-center justify-between border border-indigo-100">
                <div className="flex items-center text-indigo-900 font-semibold">
                  <CreditCard className="mr-2" size={20} />
                  Ticket Price
                </div>
                <div className="text-xl font-bold text-indigo-700">₹{selectedEvent.fee_amount}</div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Payment Instructions</label>
                <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 whitespace-pre-wrap border border-gray-200">
                  {selectedEvent.bank_details || "No payment details provided by the organizer."}
                </div>
                <p className="text-xs text-gray-500 mt-2">Please make the payment using the details above, then enter the Transaction/Reference ID below to verify your ticket.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Transaction ID</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g., UTR, Ref No, or Txn ID"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  value={transactionId} 
                  onChange={e => setTransactionId(e.target.value)} 
                />
              </div>

              <button 
                onClick={async () => {
                  if (!transactionId) return alert("Please enter the Transaction ID");
                  try {
                    await api.post('/registrations', { event_id: selectedEvent.id, transaction_id: transactionId });
                    alert('Payment submitted! Awaiting Admin verification.');
                    setSelectedEvent(null);
                  } catch (error) {
                    alert(error.response?.data?.message || 'Failed to submit payment.');
                  }
                }}
                className="w-full py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
              >
                Submit Payment & Register
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EventListing;
