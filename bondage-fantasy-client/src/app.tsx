import "./app.css";
import "./i18n";
import AccountRegistrationPage from "./pages/account-registration-page";
import HomePage from "./pages/home-page";
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
        <AppRouter />
      </MantineProvider>
    </QueryClientProvider>
  );
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/account/create" element={<AccountRegistrationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
