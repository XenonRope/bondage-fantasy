import "./app.css";
import AccountRegistrationPage from "./pages/account-registration-page";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router";

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <MantineProvider>
        <Notifications />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AccountRegistrationPage />} />
          </Routes>
        </BrowserRouter>
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;
