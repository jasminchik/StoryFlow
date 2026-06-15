import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Profile from './pages/Profile';
import Updates from './pages/Updates/Updates';
import MangaDetails from './pages/MangaDetails/MangaDetails';
import Favorites from './pages/Favorites/Favorites';
import Authors from './pages/Authors/Authors';
import ReadingNow from './pages/ReadingNow/ReadingNow';
import Notifications from './pages/Notifications/Notifications';
import CreateManga from './pages/CreateManga/CreateManga';
import EditManga from './pages/CreateManga/EditManga';
import CreateFanfic from './pages/Fanfic/CreateFanfic';
import FanficDetails from './pages/Fanfic/FanficDetails';
import ReadFanfic from './pages/Fanfic/ReadFanfic';
import ReadManga from './pages/Manga/ReadManga';
import AuthSuccess from './pages/AuthSuccess';
import AdminPanel from './pages/Admin/AdminPanel';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import styles from './App.module.scss';

function App() {
  return (
    <div className={styles.appWrapper}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/updates" element={<Updates />} />
        <Route path="/manga/:id" element={<MangaDetails />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/authors" element={<Authors />} />
        <Route path="/reading-now" element={<ReadingNow />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/create-manga" element={<CreateManga />} />
        <Route path="/edit-manga/:id" element={<EditManga />} />
        <Route path="/create-fanfic" element={<CreateFanfic />} />
        <Route path="/fanfic/:id" element={<FanficDetails />} />
        <Route path="/fanfic/:id/read/:chapterId" element={<ReadFanfic />} />
        <Route path="/manga/:titleId/read/:chapterId" element={<ReadManga />} />
        <Route path="/auth-success" element={<AuthSuccess />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
      <Footer />
      <BottomNav />
    </div>
  );
}

export default App;
