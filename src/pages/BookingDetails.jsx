// frontend/src/pages/BookingDetails.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE, getAuthHeaders } from "../utils/api";

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/bookings/${id}`, {
          ...getAuthHeaders(),
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Failed to load booking details");
        }
        const data = await res.json();
        setBooking(data);
      } catch (err) {
        setError(err.message || "Failed to load booking");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (loading) return <div className="p-6 text-white">Loading...</div>;
  if (error) return <div className="p-6 text-red-400">{error}</div>;
  if (!booking) return <div className="p-6 text-gray-400">Booking not found</div>;

  // Build a minimal status history if backend doesn't supply one
  const statusHistory =
    booking.statusHistory && booking.statusHistory.length
      ? booking.statusHistory
      : [
          { status: "pending", date: booking.createdAt },
          ...(booking.status && booking.status !== "pending"
            ? [{ status: booking.status, date: booking.updatedAt || booking.createdAt }]
            : []),
        ];

  const owner = booking.warehouse?.owner;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-gray-900 text-white p-6">
      <button
        onClick={() => navigate("/dashboard/merchant")}
        className="mb-4 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded"
      >
        ← Back to Dashboard
      </button>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 max-w-2xl mx-auto shadow-lg">
        <h1 className="text-2xl font-bold mb-2">{booking.warehouse?.name || "Warehouse"}</h1>
        <p className="text-gray-300 mb-2">{booking.warehouse?.address}</p>
        <p className="text-gray-300 mb-2">
          Status:{" "}
          <span
            className={
              booking.status === "accepted"
                ? "text-green-400"
                : booking.status === "pending"
                ? "text-yellow-300"
                : "text-red-400"
            }
          >
            {booking.status}
          </span>
        </p>

        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Status History</h2>
          <ul className="text-sm text-gray-300 space-y-1">
            {statusHistory.map((s, idx) => (
              <li key={idx}>
                <strong>{s.status}</strong> — {new Date(s.date).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>

        {booking.status === "accepted" && owner && (
          <div className="mt-4 p-4 bg-white/5 rounded">
            <h2 className="text-lg font-semibold mb-2">Owner Contact</h2>
            <p>Name: {owner.name}</p>
            <p>Email: {owner.email}</p>
            <p>Phone: {owner.contactNumber || "N/A"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
