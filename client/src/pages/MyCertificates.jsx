import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Award, Download, Calendar } from 'lucide-react';

const MyCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const res = await api.get('/certificates/me');
        setCertificates(res.data?.data?.certificates || []);
      } catch (error) {
        console.error("Failed to fetch certificates", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  const handleDownload = async (certId, eventTitle) => {
    try {
      const res = await api.get(`/certificates/${certId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${eventTitle.replace(/[^a-z0-9]/gi, '_')}_Certificate.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      let errorMsg = error.message;
      if (error.response?.data instanceof Blob) {
          try {
              const text = await error.response.data.text();
              const json = JSON.parse(text);
              errorMsg = json.message || text;
          } catch (e) {
              errorMsg = "Server returned an error file";
          }
      } else if (error.response?.data?.message) {
          errorMsg = error.response.data.message;
      }
      alert(`Failed to download certificate: ${errorMsg}`);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">My Certificates</h2>
          <p className="text-gray-500 mt-1">Download and verify your earned certificates.</p>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
            <Award size={64} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No Certificates Yet</h3>
            <p className="text-gray-500 mt-2 max-w-md">Attend events and wait for the organizers to generate your certificates. They will appear here once ready!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col">
                <div className="h-32 relative bg-indigo-900 overflow-hidden flex items-center justify-center">
                   <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                   <Award size={48} className="text-yellow-400 relative z-10" />
                   {cert.event_banner && (
                       <img src={cert.event_banner} alt="event" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
                   )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Certificate of Participation</p>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 flex-1">{cert.event_title}</h3>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Calendar size={14} className="mr-1.5" />
                        Issued: {new Date(cert.issued_at).toLocaleDateString()}
                    </div>
                    
                    <div className="text-xs text-gray-400 mb-4 font-mono bg-gray-50 px-2 py-1 rounded inline-block self-start">
                        ID: {cert.certificate_code}
                    </div>

                    <button 
                        onClick={() => handleDownload(cert.id, cert.event_title)}
                        className="w-full flex items-center justify-center py-2.5 px-4 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-semibold rounded-xl transition-colors duration-200"
                    >
                        <Download size={18} className="mr-2" />
                        Download PDF
                    </button>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCertificates;
