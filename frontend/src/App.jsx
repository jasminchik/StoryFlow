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
import AuthSuccess from './pages/AuthSuccess';
import BottomNav from './components/BottomNav';
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
        <Route path="/auth-success" element={<AuthSuccess />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default App;
