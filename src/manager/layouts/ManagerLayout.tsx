import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";

import ManagerSidebar from "../components/ManagerSidebar";
import ManagerHeader from "../components/ManagerHeader";

import "./ManagerLayout.css";

const ManagerLayout = () => {
  return (
    <Box className="manager-layout">
      <ManagerSidebar />

      <Box className="manager-layout-main">
        <ManagerHeader />

        <Box component="main" className="manager-layout-content">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default ManagerLayout;

