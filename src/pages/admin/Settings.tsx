import { useState } from "react";

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="page">
      <h1>Application Settings</h1>

      <div className="card">
        <label>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />

          {" "}Enable Dark Mode
        </label>

        <br />
        <br />

        <button>Save Settings</button>
      </div>
    </div>
  );
};

export default Settings;