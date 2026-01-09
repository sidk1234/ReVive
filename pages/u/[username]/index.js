import React from 'react';
import { useRouter } from 'next/router';
import Profile from '../../Profile';

export default function UserProfilePage() {
  const router = useRouter();
  const { username } = router.query;
  const routeUsername = Array.isArray(username) ? username[0] : username;

  return <Profile routeUsername={routeUsername} />;
}
