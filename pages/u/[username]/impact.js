import React from 'react';
import { useRouter } from 'next/router';
import MyImpact from '../../MyImpact';

export default function UserImpactPage() {
  const router = useRouter();
  const { username } = router.query;
  const routeUsername = Array.isArray(username) ? username[0] : username;

  return <MyImpact routeUsername={routeUsername} />;
}
