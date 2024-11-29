import "./App.css";
import AccountRegistrationPage from "./pages/AccountRegistrationPage";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { BrowserRouter, Route, Routes } from "react-router";

function App() {
  return (
    <MantineProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AccountRegistrationPage />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
