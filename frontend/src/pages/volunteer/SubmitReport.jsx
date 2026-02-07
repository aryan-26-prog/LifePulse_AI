import { useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/api";

export default function SubmitReport() {

  const { campId } = useParams();
  const volunteerId = localStorage.getItem("volunteerId");

  const [form, setForm] = useState({
    description: "",
    peopleHelped: "",
    hoursWorked: ""
  });

  const [images, setImages] = useState([]);

  const submitReport = async (e) => {
    e.preventDefault();

    const data = new FormData();

    data.append("campId", campId);
    data.append("description", form.description);
    data.append("peopleHelped", form.peopleHelped);
    data.append("hoursWorked", form.hoursWorked);

    images.forEach(img => data.append("images", img));

    try {
      await API.post(
        `/work-report/submit/${volunteerId}`,
        data
      );

      alert("Report submitted successfully");

    } catch {
      alert("Submission failed");
    }
  };

  return (
    <form className="form" onSubmit={submitReport}>

      <h2>Submit Work Report</h2>

      <textarea
        placeholder="Describe work done"
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
      />

      <input
        type="number"
        placeholder="People helped"
        onChange={(e) =>
          setForm({ ...form, peopleHelped: e.target.value })
        }
      />

      <input
        type="number"
        placeholder="Hours worked"
        onChange={(e) =>
          setForm({ ...form, hoursWorked: e.target.value })
        }
      />

      <input
        type="file"
        multiple
        onChange={(e) =>
          setImages([...e.target.files])
        }
      />

      <button>Submit Report</button>

    </form>
  );
}
