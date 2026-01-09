// Centralized icon exports.
//
// This module wraps imports from `lucide-react` and re‑exports only the icons used
// throughout the ReVive application. Centralizing the imports in one file
// helps avoid accidentally pulling in icon modules that may not exist in
// certain builds and makes it simple to swap the icon library later if
// desired. If you need to add a new icon, import it from `lucide-react` at
// the top of this file and add it to the export list below.

import {
  // basic icons
  Target,
  Eye,
  Heart,
  Users,
  Globe2,
  Leaf,
  // arrows and navigation
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  // interface icons
  Menu,
  X,
  User,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
  // stats and charts
  TrendingUp,
  Droplets,
  Wind,
  TreePine,
  Factory,
  // awards and messages
  Award,
  Trophy,
  MessageSquare,
  Star,
  // forms and actions
  Plus,
  Calendar,
  Trash2,
  Loader2,
  Building2,
  GraduationCap,
  Save,
  FileText,
  // location and utilities
  MapPin,
  Mail,
  Phone,
  Navigation,
  Search,
  Clock,
  Check
} from 'lucide-react';

export {
  // basic
  Target,
  Eye,
  Heart,
  Users,
  Globe2,
  Leaf,
  // arrows
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  // navigation/menu
  Menu,
  X,
  User,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
  // stats
  TrendingUp,
  Droplets,
  Wind,
  TreePine,
  Factory,
  // awards
  Award,
  Trophy,
  MessageSquare,
  Star,
  // forms/actions
  Plus,
  Calendar,
  Trash2,
  Loader2,
  Building2,
  GraduationCap,
  Save,
  FileText,
  // location and util
  MapPin,
  Mail,
  Phone,
  Navigation,
  Search,
  Clock,
  // misc
  Check
};