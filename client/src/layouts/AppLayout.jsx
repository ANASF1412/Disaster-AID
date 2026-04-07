import React from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";

const AppLayout = ({ children, title }) => (
  <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-950">
    <Sidebar />
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title={title} />
      <motion.main
        key={title}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex-1 overflow-y-auto p-6"
      >
        {children}
      </motion.main>
    </div>
  </div>
);

export default AppLayout;
