import { useEffect, useState } from "react";
import API from "../../api/api";

export default function NGOManagement() {

  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Fetch NGOs
  const fetchNGOs = async () => {
    try {
      setLoading(true);

      const res = await API.get("/admin/ngos");
      setNgos(res.data.data);

    } catch (err) {
      console.error("NGO fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNGOs();
  }, []);

  // Toggle block
  const toggleBlock = async (id) => {
    try {
      setProcessingId(id);

      await API.put(`/admin/ngo/${id}/block`);

      // refresh list
      fetchNGOs();

    } catch (err) {
      console.error("Block error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <p>Loading NGOs...</p>;

  return (
    <div className="admin-container">

      <h2>🏢 NGO Management Panel</h2>

      <table className="ngo-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {ngos.map((ngo) => (
            <tr key={ngo._id}>
              <td>{ngo.name}</td>
              <td>{ngo.email}</td>

              <td>
                <span className={ngo.isBlocked ? "blocked" : "active"}>
                  {ngo.isBlocked ? "Blocked ❌" : "Active ✅"}
                </span>
              </td>

              <td>
                <button
                  disabled={processingId === ngo._id}
                  onClick={() => toggleBlock(ngo._id)}
                  className={ngo.isBlocked ? "unblock" : "block"}
                >
                  {processingId === ngo._id
                    ? "Updating..."
                    : ngo.isBlocked
                    ? "Unblock"
                    : "Block"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
