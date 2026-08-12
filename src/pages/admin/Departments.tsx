import { useEffect, useState } from "react";
import "./Departments.css";
import organizationApi from "../../services/organizationApi";

interface Department {
  _id: string;
  name: string;
  code: string;
  locationId?: {
    name: string;
    code: string;
  };
}

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const data = await organizationApi.getDepartments();
        setDepartments(data);
      } catch (err) {
        setError("Failed to load departments.");
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  return (
    <div className="admin-departments-page">
      <div className="departments-header">
        <div>
          <h1>Departments 🏢</h1>
          <p>Manage the departments that shape your teams and reporting structure.</p>
        </div>
      </div>

      <div className="departments-card">
        {loading ? (
          <div className="departments-loading">
            <div className="spinner"></div>
            <p>Loading departments...</p>
          </div>
        ) : error ? (
          <div className="departments-error">
            <p>❌ {error}</p>
          </div>
        ) : (
          <div className="departments-table-wrapper">
            <table className="departments-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Department Name</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {departments.length > 0 ? (
                  departments.map((department) => (
                    <tr key={department._id}>
                      <td>
                        <span className="dept-code">{department.code}</span>
                      </td>
                      <td className="dept-name">
                        <div className="dept-name-wrapper">
                          <span className="dept-icon">💼</span>
                          {department.name}
                        </div>
                      </td>
                      <td>
                        <span className="location-badge">
                          {department.locationId?.name || "Global"}
                        </span>
                      </td>
                      <td>
                        <span className="status-badge active">Active</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="no-data">
                      No departments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Departments;