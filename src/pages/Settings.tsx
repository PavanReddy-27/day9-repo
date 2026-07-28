const Settings = () => {
    return (
      <div className="dashboard-section">
        <h2>Settings</h2>
        <p>Application settings page.</p>
      </div>
    );
  };
  
  export default Settings;
import { useState } from "react";

function Settings() {
  const [notifications, setNotifications] =
    useState(true);

  const [darkMode, setDarkMode] =
    useState(false);

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Settings</h1>

          <p>
            Manage your dashboard
            preferences and account settings.
          </p>
        </div>
      </div>

      <div className="analytics-card">
        <h2>Application Settings</h2>

        <div className="settings-row">
          <div>
            <strong>
              Email Notifications
            </strong>

            <p>
              Receive workforce analytics
              notifications by email.
            </p>
          </div>

          <label className="switch">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(event) =>
                setNotifications(
                  event.target.checked,
                )
              }
            />

            <span className="slider" />
          </label>
        </div>

        <div className="settings-row">
          <div>
            <strong>
              Dark Mode
            </strong>

            <p>
              Use dark mode for the
              application interface.
            </p>
          </div>

          <label className="switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(event) =>
                setDarkMode(
                  event.target.checked,
                )
              }
            />

            <span className="slider" />
          </label>
        </div>
      </div>
    </section>
  );
}

export default Settings;
