import { useState, useEffect } from 'react';
import { ScreenType, HazardTicket, UserRole } from './types';
import { NavigationBanner } from './components/NavigationBanner';
import { LandingScreen } from './screens/LandingScreen';
import { AuthScreen } from './screens/AuthScreen';
import { MapScreen } from './screens/MapScreen';
import { ReportScreen } from './screens/ReportScreen';
import { TrackingScreen } from './screens/TrackingScreen';
import { OpsDashboardScreen } from './screens/OpsDashboardScreen';
import { api } from './services/api';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('landing');
  const [tickets, setTickets] = useState<HazardTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // Report location state for seamlessly sharing selected coordinates between Map and ReportScreen
  const [reportLocation, setReportLocation] = useState<{
    location: string;
    landmark: string;
    ward: string;
    coordinates: { lat: number; lng: number; str: string };
    accuracy?: string;
    source?: 'device' | 'map' | 'preset';
  }>({
    location: 'M.G. Road, Ward 4',
    landmark: 'Near City Center Mall, Southbound lane',
    ward: 'Ward 4 - West Sector',
    coordinates: { lat: 19.2431, lng: 73.1342, str: '19.2431° N, 73.1342° E' },
    accuracy: '±2.8m precision',
    source: 'preset',
  });
  const [isPickingLocationForReport, setIsPickingLocationForReport] = useState<boolean>(false);

  // Sync tickets with backend on mount
  useEffect(() => {
    let isMounted = true;
    api.getTickets().then((data) => {
      if (isMounted && data) {
        setTickets(data);
        if (data.length > 0) {
          setSelectedTicketId((prev) => (prev ? prev : data[0].id));
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0] || null;

  // Route protection handler
  const handleNavigate = (targetScreen: ScreenType) => {
    // Only 'landing' and 'signin' are allowed without login
    if (!isLoggedIn && targetScreen !== 'landing' && targetScreen !== 'signin') {
      setCurrentScreen('signin');
      return;
    }
    setCurrentScreen(targetScreen);
  };

  const handleStartPickingLocation = () => {
    setIsPickingLocationForReport(true);
    setCurrentScreen('map');
  };

  const handleConfirmLocationFromMap = (loc: {
    location: string;
    landmark: string;
    ward: string;
    coordinates: { lat: number; lng: number; str: string };
  }) => {
    setReportLocation({
      ...loc,
      accuracy: '±1.2m map pin precision',
      source: 'map',
    });
    setIsPickingLocationForReport(false);
    setCurrentScreen('report');
  };

  const handleCancelPickingLocation = () => {
    setIsPickingLocationForReport(false);
    setCurrentScreen('report');
  };

  const handleLogin = (role: UserRole) => {
    setIsLoggedIn(true);
    setUserRole(role);
    if (role === 'dispatcher') {
      setCurrentScreen('ops');
    } else {
      setCurrentScreen('map');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentScreen('landing');
  };

  const handleAddTicket = async (newTicketData: Partial<HazardTicket>) => {
    // Call backend API
    const createdTicket = await api.createTicket(newTicketData);
    setTickets((prev) => [createdTicket, ...prev]);
    setSelectedTicketId(createdTicket.id);
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: HazardTicket['status']) => {
    await api.updateTicket(ticketId, { status });
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status,
              statusLabel:
                status === 'dispatched'
                  ? 'Work Order Dispatched'
                  : status === 'repaired'
                  ? 'Repaired & Verified'
                  : status === 'investigating'
                  ? 'Crew On-Site'
                  : status === 'verified'
                  ? 'AI Verified & Clustered'
                  : 'Report Logged',
            }
          : t
      )
    );
  };

  const unassignedCount = tickets.filter((t) => t.assignedInspector === 'Unassigned' || !t.assignedInspector).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#0b1c30]">
      {/* Top Banner */}
      <NavigationBanner
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        onLogout={handleLogout}
        unassignedCount={unassignedCount}
      />

      {/* Screen Views */}
      <div className="flex-1 w-full">
        {currentScreen === 'landing' && (
          <LandingScreen
            onNavigate={handleNavigate}
            isLoggedIn={isLoggedIn}
            userRole={userRole}
          />
        )}

        {currentScreen === 'signin' && (
          <AuthScreen
            onNavigate={handleNavigate}
            onLogin={handleLogin}
          />
        )}

        {/* Protected screens: only rendered when logged in */}
        {currentScreen === 'map' && isLoggedIn && (
          <MapScreen
            onNavigate={handleNavigate}
            tickets={tickets}
            selectedTicketId={selectedTicketId}
            onSelectTicket={(id) => setSelectedTicketId(id)}
            isPickingLocationForReport={isPickingLocationForReport}
            onConfirmLocationForReport={handleConfirmLocationFromMap}
            onCancelPickingLocation={handleCancelPickingLocation}
          />
        )}

        {currentScreen === 'report' && isLoggedIn && (
          <ReportScreen
            onNavigate={handleNavigate}
            onSubmitReport={handleAddTicket}
            initialLocation={reportLocation}
            onLocationChange={setReportLocation}
            onGoToMapToPick={handleStartPickingLocation}
          />
        )}

        {currentScreen === 'tracking' && isLoggedIn && (
          <TrackingScreen
            onNavigate={handleNavigate}
            ticket={selectedTicket}
          />
        )}

        {currentScreen === 'ops' && isLoggedIn && (
          <OpsDashboardScreen
            onNavigate={handleNavigate}
            tickets={tickets}
            selectedTicketId={selectedTicketId}
            onSelectTicket={(id) => setSelectedTicketId(id)}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onAddTicket={handleAddTicket}
          />
        )}
      </div>
    </div>
  );
}
