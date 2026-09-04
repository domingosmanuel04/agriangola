import { type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./store/auth";
import { AppShell } from "./components/layout";
import { LandingPage } from "./pages/Landing";
import { LoginPage, StartPage } from "./pages/Auth";
import { DashboardPage } from "./pages/app/Dashboard";
import { ListingDetailPage, MarketplacePage, NewListingPage } from "./pages/app/Marketplace";
import { DemandDetailPage, DemandsPage, NewDemandPage } from "./pages/app/Demands";
import { NegotiationDetailPage, NegotiationsPage } from "./pages/app/Negotiations";
import { OrderDetailPage, OrdersPage } from "./pages/app/Orders";
import { LogisticsPage, ShipmentDetailPage } from "./pages/app/Logistics";
import { MapPage } from "./pages/app/MapPage";
import { AgriAiPage } from "./pages/app/AgriAI";
import { PricesPage } from "./pages/app/Prices";
import { FarmsPage } from "./pages/app/Farms";
import { AdminPage } from "./pages/app/Admin";
import {
  CommunityPage,
  InventoryPage,
  NotificationsPage,
  OpportunitiesPage,
  ProfilePage,
  PublicCatalogPage,
  SearchPage,
  WarehousesPage,
} from "./pages/app/More";
import { Spinner } from "./components/ui";

function Guard({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="flex min-h-screen items-center justify-center"><Spinner /></div>;
  if (!user) return <Navigate to="/entrar" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/entrar" element={<LoginPage />} />
      <Route path="/comecar" element={<StartPage />} />
      <Route path="/marketplace" element={<PublicCatalogPage kind="listings" />} />
      <Route path="/procuras" element={<PublicCatalogPage kind="demands" />} />
      <Route
        path="/app"
        element={
          <Guard>
            <AppShell />
          </Guard>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="marketplace/nova" element={<NewListingPage />} />
        <Route path="marketplace/:id" element={<ListingDetailPage />} />
        <Route path="procuras" element={<DemandsPage />} />
        <Route path="procuras/nova" element={<NewDemandPage />} />
        <Route path="procuras/:id" element={<DemandDetailPage />} />
        <Route path="negociacoes" element={<NegotiationsPage />} />
        <Route path="negociacoes/:id" element={<NegotiationDetailPage />} />
        <Route path="pedidos" element={<OrdersPage />} />
        <Route path="pedidos/:id" element={<OrderDetailPage />} />
        <Route path="logistica" element={<LogisticsPage />} />
        <Route path="logistica/:id" element={<ShipmentDetailPage />} />
        <Route path="mapa" element={<MapPage />} />
        <Route path="fazenda" element={<FarmsPage />} />
        <Route path="ai" element={<AgriAiPage />} />
        <Route path="precos" element={<PricesPage />} />
        <Route path="oportunidades" element={<OpportunitiesPage />} />
        <Route path="stock" element={<InventoryPage />} />
        <Route path="armazens" element={<WarehousesPage />} />
        <Route path="comunidade" element={<CommunityPage />} />
        <Route path="notificacoes" element={<NotificationsPage />} />
        <Route path="perfil/:id" element={<ProfilePage />} />
        <Route path="pesquisa" element={<SearchPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
