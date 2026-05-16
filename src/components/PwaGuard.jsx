import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Redirects browser (non-PWA) visitors away from app routes back to the landing page.
 * PWA users (standalone display mode) and iOS users with navigator.standalone pass through freely.
 */
export default function PwaGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // PWA guard disabled — all web users can access app routes freely

  return children;
}