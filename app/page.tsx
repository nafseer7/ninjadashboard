import Header from "./components/header";
import LeftNavbar from "./components/LeftNavbar";
import MainPage from "./components/mainPage";
import NotificationPanel from "./components/NotificationPanel";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Navigation Bar */}
      <LeftNavbar />



      {/* Main Content Area */}
      <div className="flex flex-col w-full">
        {/* Header */}
        <Header />

        {/* Content Section */}
        <div className="flex flex-col md:flex-row md:space-x-4 p-6">
          {/* Left Panel: Notification */}
          <div className="md:w-1/4 bg-white rounded-lg shadow-md p-4 mb-6 md:mb-0">
            <NotificationPanel />
          </div>

          {/* Main Dashboard Content */}
          <div className="flex-grow bg-white rounded-lg shadow-md p-6">
            <MainPage />
          </div>
        </div>
      </div>
    </div>
  );
}
