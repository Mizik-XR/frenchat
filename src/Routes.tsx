
import { React } from "@/core/ReactInstance";
import { Routes as RouterRoutes, Route } from "react-router-dom";
import Home from "@/pages/Home";

const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<Home />} />
      {/* D'autres routes peuvent être ajoutées ici */}
    </RouterRoutes>
  );
};

export default Routes;
