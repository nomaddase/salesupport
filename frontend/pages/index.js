import { useEffect, useMemo, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import useStore from '@/state/useStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Home() {
  const [socket, setSocket] = useState(null);
  const clients = useStore((state) => state.clients);
  const setClients = useStore((state) => state.setClients);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
        const response = await axios.get(`${API_URL}/clients`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setClients(response.data);
      } catch (error) {
        console.error('Failed to fetch clients', error);
      }
    };

    fetchClients();
  }, [setClients]);

  useEffect(() => {
    const socketInstance = io(API_URL, { transports: ['websocket'] });
    socketInstance.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });
    socketInstance.on('message', (message) => {
      console.log('Incoming message', message);
    });
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const highPriority = useMemo(() => clients.filter((client) => client.priority === 'high'), [clients]);

  return (
    <main className="min-h-screen p-6">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">AI-driven Web CRM Platform</h1>
        <p className="text-slate-600">Real-time dashboard with AI-assisted workflows.</p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">Total Clients</h2>
          <p className="text-4xl font-bold">{clients.length}</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">High Priority</h2>
          <p className="text-4xl font-bold text-rose-500">{highPriority.length}</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">Socket Status</h2>
          <p className="text-sm text-slate-500">{socket ? 'Connected' : 'Connecting...'}</p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Client List</h2>
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-slate-700">{client.name}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-slate-500">{client.status}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        client.priority === 'high'
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-emerald-100 text-emerald-600'
                      }`}
                    >
                      {client.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
